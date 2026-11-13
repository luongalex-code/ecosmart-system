'use strict';
const fs = require('node:fs');
const path = require('node:path');
const { randomUUID } = require('node:crypto');
const labels = { organic: 'Hữu Cơ', recycle: 'Nhựa / Tái chế', other: 'Rác Khác' };

// Only invoked for completed sorting events, never for periodic scale readings.
function applyEvent(dbPath, device, event, allowSimulation = false) {
  if (event.mode === 'simulation' && !allowSimulation) return false;
  const db = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
  if (!db || typeof db !== 'object' || Array.isArray(db)) throw new Error('Invalid existing database');
  const key = `${device}/${event.id}`;
  const processed = Array.isArray(db.iot_processed_events) ? db.iot_processed_events : [];
  if (processed.includes(key)) return false;
  db.iot_processed_events = [...processed, key].slice(-2048);
  const logs = Array.isArray(db.waste_logs) ? db.waste_logs : [];
  db.waste_logs = [{ id: `IOT-${device}-${event.id}`, time: new Date().toLocaleTimeString('vi-VN'),
    ai_type: labels[event.category], confidence: event.confidence, weight: event.weight_kg,
    image_url: '', device_id: device, simulated: event.mode === 'simulation' }, ...logs].slice(0, 100);
  const stats = db.waste_stats || {};
  const field = { organic: 'organic_kg', recycle: 'recycle_kg', other: 'other_kg' }[event.category];
  for (const name of ['organic_kg', 'recycle_kg', 'other_kg']) {
    if (!Number.isFinite(stats[name]) || stats[name] < 0) stats[name] = 0;
  }
  stats[field] = Math.round((stats[field] + event.weight_kg) * 1000) / 1000;
  stats.total_kg = Math.round((stats.organic_kg + stats.recycle_kg + stats.other_kg) * 1000) / 1000;
  for (const type of ['organic', 'recycle', 'other']) {
    stats[`${type}_percent`] = stats.total_kg ? Math.round(stats[`${type}_kg`] / stats.total_kg * 100) : 0;
  }
  db.waste_stats = stats;
  const temp = path.join(path.dirname(dbPath), `.iot-${randomUUID()}.tmp`);
  try {
    fs.writeFileSync(temp, JSON.stringify(db, null, 2), { encoding: 'utf8', flag: 'wx' });
    fs.renameSync(temp, dbPath);
  } finally {
    if (fs.existsSync(temp)) fs.unlinkSync(temp);
  }
  return db;
}
module.exports = { applyEvent };
