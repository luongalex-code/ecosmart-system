'use strict';
const mqtt = require('mqtt');
const { randomUUID, timingSafeEqual, createHash } = require('node:crypto');
const { identifier, object, validCommand, validTelemetry, validEvent } = require('./protocol');
const { applyEvent } = require('./store');

function startIot({ app, io, dbPath, env = process.env }) {
  if (!env.MQTT_URL) return { close: () => {} };
  if (!env.IOT_API_TOKEN || env.IOT_API_TOKEN.length < 32) throw new Error('IOT_API_TOKEN must contain at least 32 characters');
  const url = new URL(env.MQTT_URL);
  if (!['mqtt:', 'mqtts:'].includes(url.protocol) ||
      (url.protocol === 'mqtt:' && !(env.MQTT_ALLOW_INSECURE_LOCAL === 'true' &&
        ['localhost', '127.0.0.1', '[::1]'].includes(url.hostname)))) {
    throw new Error('Use mqtts:// with certificate verification; plaintext is restricted to explicit local testing');
  }
  const allowed = (env.IOT_DEVICE_IDS || 'esp32-01').split(',');
  if (!allowed.every(identifier)) throw new Error('Invalid IOT_DEVICE_IDS');
  const devices = new Map(), commands = new Map();
  const timeoutMs = Math.min(30000, Math.max(500, Number(env.IOT_ACK_TIMEOUT_MS) || 10000));
  const tokenHash = createHash('sha256').update(env.IOT_API_TOKEN).digest();
  const auth = (req, res, next) => {
    const supplied = req.get('authorization') || '';
    const hash = createHash('sha256').update(supplied.startsWith('Bearer ') ? supplied.slice(7) : '').digest();
    if (!timingSafeEqual(hash, tokenHash)) return res.status(401).json({ error: 'unauthorized' });
    next();
  };
  const client = mqtt.connect(env.MQTT_URL, {
    clientId: env.MQTT_CLIENT_ID || 'ecosmart-backend', username: env.MQTT_USERNAME,
    password: env.MQTT_PASSWORD, reconnectPeriod: 1000, connectTimeout: 5000,
    clean: true, queueQoSZero: false, protocolVersion: 4, rejectUnauthorized: true,
  });
  let ready = false;
  client.on('connect', () => {
    client.subscribe(allowed.flatMap(id => ['telemetry', 'event', 'ack', 'status'].map(suffix =>
      `ecosmart/v1/devices/${id}/${suffix}`)), { qos: 1 }, (error, granted) => {
      ready = !error && granted.every(item => item.qos !== 128);
    });
  });
  client.on('close', () => { ready = false; });
  client.on('offline', () => { ready = false; });
  client.on('error', error => { console.warn('[IoT] MQTT error:', error.code || 'connection_error'); });
  client.on('message', (topic, bytes, packet) => {
    if (bytes.length > 1024) return;
    const match = /^ecosmart\/v1\/devices\/([A-Za-z0-9_-]{1,64})\/(telemetry|event|ack|status)$/.exec(topic);
    if (!match || !allowed.includes(match[1])) return;
    const [, device, kind] = match;
    if (packet.retain && kind !== 'status') return;
    let value;
    try { value = JSON.parse(bytes.toString('utf8')); } catch { return; }
    if (!object(value) || value.v !== 1) return;
    const state = devices.get(device) || { id: device, online: false, last_seen: 0 };
    if (kind === 'telemetry' && validTelemetry(value, device)) {
      if (state.telemetry?.boot_id === value.boot_id && state.telemetry.seq >= value.seq) return;
      Object.assign(state, { telemetry: value, last_seen: Date.now(), online: true });
      devices.set(device, state);
      io.emit('iot-device', state);
    } else if (kind === 'status' && typeof value.online === 'boolean') {
      state.online = value.online && Date.now() - state.last_seen < 10000;
      devices.set(device, state);
      io.emit('iot-device', state);
    } else if (kind === 'event' && validEvent(value, device)) {
      try {
        const updated = applyEvent(dbPath, device, value, env.IOT_SIMULATION_TO_DASHBOARD === 'true');
        if (updated) io.emit('dashboard-data', updated);
      } catch (error) { console.error('[IoT] Event persistence failed:', error.code || error.message); }
    } else if (kind === 'ack' && value.device_id === device && identifier(value.id) &&
               ['ok', 'rejected'].includes(value.status) && typeof value.reason === 'string' && value.reason.length <= 80) {
      const pending = commands.get(value.id);
      if (!pending || pending.device_id !== device || pending.state !== 'sent') return;
      pending.state = value.status;
      pending.ack = value;
      io.emit('iot-ack', pending);
    }
  });

  app.get('/api/iot/devices', auth, (req, res) => {
    res.json({ broker_connected: ready, devices: [...devices.values()].map(value => ({ ...value,
      online: ready && value.online && Date.now() - value.last_seen < 10000 })) });
  });
  app.get('/api/iot/commands/:id', auth, (req, res) => {
    const command = commands.get(req.params.id);
    if (!command) return res.status(404).json({ error: 'not_found' });
    res.json(command);
  });
  app.post('/api/iot/devices/:device/commands', auth, (req, res) => {
    const device = req.params.device, body = req.body;
    if (!allowed.includes(device)) return res.status(404).json({ error: 'unknown_device' });
    if (!object(body) || Object.keys(body).some(key => !['id', 'op', 'category', 'weight_kg', 'confidence'].includes(key)))
      return res.status(400).json({ error: 'invalid_command' });
    const command = { v: 1, id: body.id ?? randomUUID(), op: body.op,
      expires_at: Date.now() + timeoutMs, ...(body.op === 'simulate_sort' ? {
        category: body.category, weight_kg: body.weight_kg, confidence: body.confidence } : {}) };
    if (!validCommand(command)) return res.status(400).json({ error: 'invalid_command' });
    const existing = commands.get(command.id);
    if (existing) {
      const { expires_at: _a, ...a } = existing.command;
      const { expires_at: _b, ...b } = command;
      if (existing.device_id !== device || JSON.stringify(a) !== JSON.stringify(b))
        return res.status(409).json({ error: 'id_conflict' });
      return res.json(existing);
    }
    if (!ready || !client.connected) return res.status(503).json({ error: 'broker_offline' });
    if (commands.size >= 500) return res.status(429).json({ error: 'command_capacity' });
    const pending = { id: command.id, device_id: device, command, state: 'sent', created_at: Date.now() };
    commands.set(command.id, pending);
    client.publish(`ecosmart/v1/devices/${device}/command`, JSON.stringify(command), { qos: 1, retain: false }, error => {
      if (error && pending.state === 'sent') pending.state = 'publish_failed';
    });
    res.status(202).json(pending);
  });
  const watchdog = setInterval(() => {
    const now = Date.now();
    for (const [id, command] of commands) {
      if (command.state === 'sent' && now >= command.command.expires_at) {
        command.state = 'timeout';
        io.emit('iot-ack', command);
      }
      if (command.state !== 'sent' && now - command.created_at > 600000) commands.delete(id);
    }
  }, 100);
  watchdog.unref();
  return { client, close: () => { clearInterval(watchdog); client.end(true); } };
}
module.exports = { startIot };
