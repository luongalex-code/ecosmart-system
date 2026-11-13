'use strict';
const mqtt = require('mqtt');
const { randomUUID } = require('node:crypto');
const { validCommand } = require('../src/iot/protocol');

// Software protocol peer, not an ESP32 CPU/peripheral emulator.
function startSimulator(options = {}) {
  const device = options.device || 'esp32-01';
  const base = `ecosmart/v1/devices/${device}`;
  const boot = randomUUID(), started = Date.now();
  let sequence = 0, stopped = false, weight = null, ignoreCommands = false;
  const cache = new Map();
  const client = mqtt.connect(options.url || process.env.MQTT_URL, {
    clientId: options.clientId || device, username: options.username || process.env.DEVICE_MQTT_USERNAME,
    password: options.password || process.env.DEVICE_MQTT_PASSWORD, reconnectPeriod: 500,
    clean: true, protocolVersion: 4, rejectUnauthorized: true,
    will: { topic: `${base}/status`, payload: '{"v":1,"online":false}', qos: 1, retain: true },
  });
  const send = (suffix, value, retain = false) => client.publish(`${base}/${suffix}`, JSON.stringify(value), { qos: 1, retain });
  const telemetry = () => {
    if (!client.connected) return;
    send('telemetry', { v: 1, device_id: device, boot_id: boot, seq: ++sequence,
      uptime_ms: Date.now() - started, mode: 'simulation', state: stopped ? 'stopped' : 'idle',
      ir: false, limit: false, weight_valid: weight !== null, weight_kg: weight });
  };
  client.on('connect', () => client.subscribe(`${base}/command`, { qos: 1 }, () => {
    send('status', { v: 1, online: true }, true);
    telemetry();
  }));
  client.on('error', error => options.onError?.(error));
  client.on('message', (topic, bytes, packet) => {
    if (topic !== `${base}/command` || packet.retain || ignoreCommands || bytes.length > 1024) return;
    let command;
    try { command = JSON.parse(bytes.toString()); } catch { return; }
    if (!validCommand(command)) return;
    const old = cache.get(command.id);
    if (old) {
      return send('ack', old.input === JSON.stringify(command) ? old.ack : {
        v: 1, device_id: device, id: command.id, status: 'rejected', reason: 'id_conflict' });
    }
    const ack = { v: 1, device_id: device, id: command.id, status: 'ok', reason: 'completed' };
    if (command.op === 'stop') { stopped = true; ack.reason = 'software_stop_only'; }
    else if (command.op === 'status') telemetry();
    else if (command.expires_at < Date.now() || command.expires_at > Date.now() + 60000) {
      ack.status = 'rejected'; ack.reason = 'expired_or_invalid_ttl';
    } else if (command.op === 'resume') { stopped = false; ack.reason = 'simulation_resumed'; }
    else if (command.op === 'tare') { ack.status = 'rejected'; ack.reason = 'sensor_unavailable'; }
    else if (command.op === 'simulate_sort') {
      if (stopped) { ack.status = 'rejected'; ack.reason = 'stopped'; }
      else {
        weight = command.weight_kg;
        send('event', { v: 1, device_id: device, id: command.id, mode: 'simulation',
          category: command.category, confidence: command.confidence, weight_kg: weight });
        ack.reason = 'simulated';
      }
    }
    cache.set(command.id, { input: JSON.stringify(command), ack });
    if (cache.size > 32) cache.delete(cache.keys().next().value);
    send('ack', ack);
  });
  const timer = setInterval(telemetry, 500);
  timer.unref();
  return { client, setIgnoreCommands: value => { ignoreCommands = value; },
    close: () => { clearInterval(timer); return client.endAsync(true); },
    dropConnection: () => client.stream.destroy() };
}
if (require.main === module) {
  const sim = startSimulator();
  console.log('Protocol simulator started; no hardware access.');
  process.on('SIGINT', async () => { await sim.close(); process.exit(0); });
}
module.exports = { startSimulator };
