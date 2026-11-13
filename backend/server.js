const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const chokidar = require('chokidar');
const fs = require('fs');
const cors = require('cors');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: '*' }
});

const DB_PATH = process.env.DB_PATH || path.join(__dirname, 'data', 'database.json');

const readDatabase = () => {
  try {
    const raw = fs.readFileSync(DB_PATH, 'utf8');
    return JSON.parse(raw);
  } catch (err) {
    console.error('Lỗi đọc database:', err);
    return {};
  }
};

io.on('connection', (socket) => {
  console.log('⚡ Dashboard đã kết nối:', socket.id);
  // Gửi dữ liệu hiện tại ngay khi kết nối
  socket.emit('dashboard-data', readDatabase());

  socket.on('disconnect', () => {
    console.log('❌ Dashboard ngắt kết nối:', socket.id);
  });
});

// Tự động lắng nghe thay đổi file database.json để đẩy real-time
chokidar.watch(DB_PATH, { usePolling: true, interval: 300 }).on('change', () => {
  console.log('🔄 Dữ liệu biến động, đang đẩy sang Dashboard...');
  io.emit('dashboard-data', readDatabase());
});

// Integration is opt-in. Existing Socket.IO/dashboard behavior remains available without MQTT.
const { startIot } = require('./src/iot/bridge');
const iot = startIot({ app, io, dbPath: DB_PATH });

const PORT = Number(process.env.PORT) || 5000;
server.listen(PORT, () => {
  console.log(`🚀 EcoSmart Backend running at http://localhost:${PORT}`);
});

function shutdown() {
  iot.close();
  io.close();
  server.close();
  process.exit(0);
}
process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);
