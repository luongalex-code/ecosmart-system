'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const net = require('node:net');
const { spawn, execFileSync } = require('node:child_process');
const { parseEnv } = require('node:util');
const { randomUUID } = require('node:crypto');
const mqtt = require('mqtt');
const { io } = require('../../frontend/node_modules/socket.io-client');
const { startSimulator } = require('../tools/device-simulator');
const envPath = path.resolve(__dirname, '../../infra/emqx/.env');
const enabled = process.env.RUN_EMQX_TESTS === 'true';
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));
async function until(fn, label, timeout = 20000) {
  const deadline = Date.now() + timeout;
  while (Date.now() < deadline) {
    try { const value = await fn(); if (value) return value; } catch { /* startup/reconnect */ }
    await delay(50);
  }
  throw new Error(`Timed out: ${label}`);
}
async function freePort() {
  const server = net.createServer();
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const port = server.address().port;
  await new Promise(resolve => server.close(resolve));
  return port;
}

test('EMQX authenticated two-way integration, dashboard, replay, disconnect and failure paths',
  { skip: !enabled, timeout: 180000 }, async t => {
    assert.ok(fs.existsSync(envPath), 'Run infra/emqx/init-local.js and docker compose first');
    const config = parseEnv(fs.readFileSync(envPath, 'utf8'));
    const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'ecosmart-emqx-test-'));
    const dbPath = path.join(directory, 'database.json');
    const original = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../data/database.json')));
    fs.writeFileSync(dbPath, JSON.stringify(original));
    const port = await freePort();
    const base = `http://127.0.0.1:${port}`;
    let server, socket, sim, publisher;
    const logs = [];
    const startBackend = () => {
      server = spawn(process.execPath, ['server.js'], { cwd: path.resolve(__dirname, '..'),
        env: { ...process.env, ...config, PORT: String(port), DB_PATH: dbPath,
          IOT_ACK_TIMEOUT_MS: '1000', IOT_SIMULATION_TO_DASHBOARD: 'true',
          MQTT_CLIENT_ID: `ecosmart-test-backend-${randomUUID()}` }, windowsHide: true,
        stdio: ['ignore', 'pipe', 'pipe'] });
      server.stdout.on('data', chunk => logs.push(chunk.toString()));
      server.stderr.on('data', chunk => logs.push(chunk.toString()));
    };
    const stopBackend = async () => {
      if (server && server.exitCode === null) {
        const done = new Promise(resolve => server.once('exit', resolve));
        server.kill(); await done;
      }
    };
    t.after(async () => {
      socket?.disconnect();
      if (sim) await sim.close();
      if (publisher) await publisher.endAsync(true);
      await stopBackend();
      fs.rmSync(directory, { recursive: true, force: true });
    });
    const request = async (route, method = 'GET', body, authenticated = true) => {
      const response = await fetch(base + route, { method, headers: {
        ...(authenticated ? { authorization: `Bearer ${config.IOT_API_TOKEN}` } : {}),
        'content-type': 'application/json', }, ...(body ? { body: JSON.stringify(body) } : {}) });
      return { status: response.status, data: await response.json() };
    };
    const brokerReady = () => until(async () => {
      const response = await request('/api/iot/devices');
      return response.data.broker_connected;
    }, 'Backend MQTT subscriptions ready');
    startBackend();
    await brokerReady();
    assert.equal((await request('/api/iot/devices', 'GET', undefined, false)).status, 401);
    socket = io(base, { reconnection: true });
    const dashboard = [];
    socket.on('dashboard-data', value => dashboard.push(value));
    await until(() => dashboard.length, 'existing Socket.IO dashboard event');
    assert.equal(dashboard[0].station_name, original.station_name);
    sim = startSimulator({ url: config.MQTT_URL, username: config.DEVICE_MQTT_USERNAME,
      password: config.DEVICE_MQTT_PASSWORD });
    await until(async () => (await request('/api/iot/devices')).data.devices.some(d => d.online), 'telemetry');
    assert.equal((await request('/api/iot/devices/esp32-01/commands', 'POST', { op: 'servo' })).status, 400);
    assert.equal((await request('/api/iot/devices/esp32-02/commands', 'POST', { op: 'status' })).status, 404);
    const command = { id: randomUUID(), op: 'simulate_sort', category: 'organic', confidence: 98.5, weight_kg: 1.25 };
    const result = await request('/api/iot/devices/esp32-01/commands', 'POST', command);
    assert.equal(result.status, 202);
    const getCommand = id => request(`/api/iot/commands/${id}`);
    const ack = await until(async () => {
      const value = (await getCommand(command.id)).data;
      return value.state === 'ok' && value;
    }, 'sort ACK');
    assert.equal(ack.ack.reason, 'simulated');
    await until(() => dashboard.some(value => value.waste_logs?.some(log => log.id.endsWith(command.id))), 'MQTT event to existing UI payload');
    const stored = JSON.parse(fs.readFileSync(dbPath));
    assert.equal(stored.waste_stats.organic_kg, original.waste_stats.organic_kg + 1.25);
    assert.deepEqual(stored.environment, original.environment);
    assert.equal((await request('/api/iot/devices/esp32-01/commands', 'POST', command)).status, 200);
    assert.equal((await request('/api/iot/devices/esp32-01/commands', 'POST', { ...command, weight_kg: 2 })).status, 409);
    publisher = mqtt.connect(config.MQTT_URL, { username: config.MQTT_USERNAME,
      password: config.MQTT_PASSWORD, clientId: `ecosmart-test-publisher-${randomUUID()}`, reconnectPeriod: 0 });
    publisher.on('error', () => {});
    await until(() => publisher.connected, 'authenticated test publisher');
    await publisher.publishAsync('ecosmart/v1/devices/esp32-01/command', JSON.stringify(result.data.command), { qos: 1 });
    await delay(300);
    assert.equal(JSON.parse(fs.readFileSync(dbPath)).waste_stats.organic_kg, stored.waste_stats.organic_kg);
    const run = async body => {
      const sent = await request('/api/iot/devices/esp32-01/commands', 'POST', body);
      assert.equal(sent.status, 202);
      return until(async () => {
        const value = (await getCommand(sent.data.id)).data;
        return value.state !== 'sent' && value;
      }, `ACK ${body.op}`);
    };
    assert.equal((await run({ op: 'stop' })).state, 'ok');
    assert.equal((await run({ ...command, id: randomUUID() })).ack.reason, 'stopped');
    assert.equal((await run({ op: 'resume' })).ack.reason, 'simulation_resumed');
    sim.setIgnoreCommands(true);
    assert.equal((await run({ op: 'status' })).state, 'timeout');
    sim.setIgnoreCommands(false);
    // Break the transport: EMQX LWT must mark offline; reconnect must restore telemetry.
    sim.client.options.reconnectPeriod = 1500;
    sim.dropConnection();
    await until(async () => (await request('/api/iot/devices')).data.devices.some(d => !d.online), 'LWT offline');
    await until(async () => (await request('/api/iot/devices')).data.devices.some(d => d.online), 'device reconnect');
    // Persisted event dedup survives backend restart.
    await stopBackend();
    startBackend(); await brokerReady();
    const event = { v: 1, device_id: 'esp32-01', id: command.id, category: 'organic', confidence: 98.5,
      weight_kg: 1.25, mode: 'simulation' };
    await sim.client.publishAsync('ecosmart/v1/devices/esp32-01/event', JSON.stringify(event), { qos: 1 });
    await sim.client.publishAsync('ecosmart/v1/devices/esp32-01/event', '{"v":1,"weight_kg":-99}', { qos: 1 });
    await delay(300);
    assert.equal(JSON.parse(fs.readFileSync(dbPath)).waste_stats.organic_kg, stored.waste_stats.organic_kg);
    // Device credentials cannot send controller commands: ACL disconnects the offender.
    const offender = mqtt.connect(config.MQTT_URL, { username: config.DEVICE_MQTT_USERNAME,
      password: config.DEVICE_MQTT_PASSWORD, clientId: `acl-test-${randomUUID()}`, reconnectPeriod: 0 });
    offender.on('error', () => {});
    await until(() => offender.connected, 'ACL test connection');
    const denied = new Promise(resolve => offender.once('close', resolve));
    offender.publish('ecosmart/v1/devices/esp32-01/command', '{"v":1}', { qos: 1 });
    await Promise.race([denied, delay(3000).then(() => { throw new Error('ACL did not reject device command publish'); })]);
    await offender.endAsync(true);
    const bad = mqtt.connect(config.MQTT_URL, { username: config.DEVICE_MQTT_USERNAME, password: 'wrong-password',
      clientId: `auth-test-${randomUUID()}`, reconnectPeriod: 0, connectTimeout: 2000 });
    let authRejected = false;
    bad.on('error', () => { authRejected = true; });
    await until(() => authRejected, 'broker password rejection');
    await bad.endAsync(true);
    if (process.env.TEST_RESTART_EMQX === 'true') {
      const compose = path.resolve(__dirname, '../../infra/emqx/compose.yaml');
      try {
        execFileSync('docker', ['compose', '-f', compose, 'stop', 'emqx'], { windowsHide: true, stdio: 'pipe' });
        await until(async () => !(await request('/api/iot/devices')).data.broker_connected, 'broker offline');
        assert.equal((await request('/api/iot/devices/esp32-01/commands', 'POST', { op: 'status' })).status, 503);
      } finally {
        execFileSync('docker', ['compose', '-f', compose, 'start', 'emqx'], { windowsHide: true, stdio: 'pipe' });
      }
      await brokerReady();
      await until(async () => (await request('/api/iot/devices')).data.devices.some(d => d.online), 'broker and device recovery', 40000);
      assert.equal((await run({ op: 'status' })).state, 'ok');
    }
    console.log('PASS: EMQX telemetry, command/ACK, UI Socket.IO payload, auth/ACL, replay, timeout, LWT, reconnect, backend restart, optional broker restart');
  });
