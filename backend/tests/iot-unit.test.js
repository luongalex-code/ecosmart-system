'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { validCommand, validEvent, validTelemetry } = require('../src/iot/protocol');
const { applyEvent } = require('../src/iot/store');

test('reject unknown operations, invalid categories, NaN, out-of-range values', () => {
  const command = { v: 1, id: 'c-1', op: 'simulate_sort', category: 'organic', confidence: 99, weight_kg: 1, expires_at: Date.now() + 1000 };
  assert.equal(validCommand(command), true);
  for (const patch of [{ op: 'servo' }, { id: '../x' }, { confidence: NaN }, { weight_kg: -1 },
    { category: 'unknown' }, { confidence: 101 }, { expires_at: 1.5 }]) {
    assert.equal(validCommand({ ...command, ...patch }), false);
  }
  assert.equal(validEvent({ ...command, device_id: 'esp32-01', mode: 'simulation' }, 'other-device'), false);
  assert.equal(validTelemetry({}, 'esp32-01'), false);
});

test('atomic event merge preserves existing dashboard fields; persists dedup; simulations opt-in', t => {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'ecosmart-unit-'));
  t.after(() => fs.rmSync(directory, { recursive: true, force: true }));
  const file = path.join(directory, 'database.json');
  const original = { station_name: 'Existing', environment: { temperature: 31 },
    waste_stats: { organic_kg: 2, recycle_kg: 3, other_kg: 5 }, waste_logs: [] };
  fs.writeFileSync(file, JSON.stringify(original));
  const event = { v: 1, id: 'e-1', device_id: 'esp32-01', category: 'organic', confidence: 95, weight_kg: 1.25, mode: 'simulation' };
  assert.equal(applyEvent(file, 'esp32-01', event), false);
  assert.deepEqual(JSON.parse(fs.readFileSync(file)), original);
  const updated = applyEvent(file, 'esp32-01', event, true);
  assert.equal(updated.waste_stats.total_kg, 11.25);
  assert.deepEqual(updated.environment, original.environment);
  assert.equal(updated.waste_logs[0].weight, 1.25);
  assert.equal(applyEvent(file, 'esp32-01', event, true), false);
  assert.equal(JSON.parse(fs.readFileSync(file)).waste_logs.length, 1);
});

test('invalid existing database is never overwritten by IoT adapter', t => {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'ecosmart-unit-'));
  t.after(() => fs.rmSync(directory, { recursive: true, force: true }));
  const file = path.join(directory, 'database.json');
  fs.writeFileSync(file, 'broken-json');
  assert.throws(() => applyEvent(file, 'esp32-01', { mode: 'hardware', id: 'e-2' }));
  assert.equal(fs.readFileSync(file, 'utf8'), 'broken-json');
});
