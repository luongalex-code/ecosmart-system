import React, { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Dashboard from './pages/Dashboard';
import Households from './pages/Households';
import Logs from './pages/Logs';
import Devices from './pages/Devices';
import Settings from './pages/Settings';
const SOCKET_SERVER_URL = 'http://localhost:5000';

export default function App() {
  const [activeTab, setActiveTab] = useState('Dashboard');
  const [data, setData] = useState(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const socket = io(SOCKET_SERVER_URL);

    socket.on('connect', () => setIsConnected(true));
    socket.on('disconnect', () => setIsConnected(false));
    socket.on('dashboard-data', (incomingData) => setData(incomingData));

    return () => socket.disconnect();
  }, []);

  return (
    <div className="flex min-h-screen bg-[#e2e8f0] font-sans p-3">
      <div className="flex-1 bg-[#edf2f7] rounded-[40px] border border-white/60 shadow-xl overflow-hidden flex">
        {/* Sidebar dùng chung */}
        <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

        <div className="flex-1 flex flex-col overflow-y-auto">
          {/* Header dùng chung */}
          <Header isConnected={isConnected} />

          {/* CHUYỂN MÀN HÌNH THEO TAB ĐANG CHỌN */}
          {activeTab === 'Dashboard' && <Dashboard data={data} />}
          {activeTab === 'Hộ gia đình' && <Households />}
          {activeTab === 'Logs' && <Logs />}
          {activeTab === 'Devices' && <Devices />}
          {activeTab === 'Settings' && <Settings />}
        </div>
      </div>
    </div>
  );
}