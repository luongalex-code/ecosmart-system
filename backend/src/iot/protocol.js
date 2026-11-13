'use strict';
const identifier = value => typeof value === 'string' && /^[A-Za-z0-9_-]{1,64}$/.test(value);
const category = value => ['organic', 'recycle', 'other'].includes(value);
const number = (value, min, max) => typeof value === 'number' && Number.isFinite(value) && value >= min && value <= max;
const object = value => value !== null && typeof value === 'object' && !Array.isArray(value);

function validCommand(command) {
  if (!object(command) || command.v !== 1 || !identifier(command.id) ||
      !['status', 'stop', 'resume', 'tare', 'simulate_sort'].includes(command.op) ||
      !Number.isSafeInteger(command.expires_at) || command.expires_at <= 0) return false;
  return command.op !== 'simulate_sort' || (category(command.category) &&
    number(command.weight_kg, 0.001, 100) && number(command.confidence, 0, 100));
}

function validTelemetry(value, device) {
  return object(value) && value.v === 1 && value.device_id === device && identifier(value.boot_id) &&
    Number.isSafeInteger(value.seq) && value.seq >= 0 && number(value.uptime_ms, 0, Number.MAX_SAFE_INTEGER) &&
    ['simulation', 'hardware_locked'].includes(value.mode) && ['idle', 'stopped'].includes(value.state) &&
    typeof value.ir === 'boolean' && typeof value.limit === 'boolean' && typeof value.weight_valid === 'boolean' &&
    (value.weight_valid ? number(value.weight_kg, 0, 100) : value.weight_kg === null);
}

function validEvent(value, device) {
  return object(value) && value.v === 1 && value.device_id === device && identifier(value.id) &&
    category(value.category) && ['simulation', 'hardware'].includes(value.mode) &&
    number(value.weight_kg, 0.001, 100) && number(value.confidence, 0, 100);
}
module.exports = { identifier, category, number, object, validCommand, validTelemetry, validEvent };
