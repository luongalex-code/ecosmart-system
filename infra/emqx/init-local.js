'use strict';
const fs = require('node:fs');
const path = require('node:path');
const { randomBytes } = require('node:crypto');
const secret = () => randomBytes(24).toString('hex');
const envFile = path.join(__dirname, '.env'), csvFile = path.join(__dirname, 'bootstrap.csv');
if (fs.existsSync(envFile) || fs.existsSync(csvFile)) {
  console.log('Local credential files already exist; no files overwritten.');
  process.exit(0);
}
const backend = secret(), device = secret();
fs.writeFileSync(csvFile, `user_id,password,is_superuser\nbackend,${backend},false\nesp32-01,${device},false\n`, { flag: 'wx', mode: 0o600 });
fs.writeFileSync(envFile, [
  'MQTT_PORT=18883', 'EMQX_DASHBOARD_PORT=18093', `EMQX_NODE_COOKIE=${secret()}`,
  `EMQX_DASHBOARD_PASSWORD=${secret()}`, 'MQTT_URL=mqtt://127.0.0.1:18883',
  'MQTT_ALLOW_INSECURE_LOCAL=true', 'MQTT_USERNAME=backend', `MQTT_PASSWORD=${backend}`,
  'DEVICE_MQTT_USERNAME=esp32-01', `DEVICE_MQTT_PASSWORD=${device}`,
  `IOT_API_TOKEN=${secret()}`, 'IOT_DEVICE_IDS=esp32-01', 'IOT_SIMULATION_TO_DASHBOARD=false', '',
].join('\n'), { flag: 'wx', mode: 0o600 });
console.log('Created ignored local credentials (values not printed).');
