import React, { useState } from 'react';
import { 
  Radio, 
  Cpu, 
  Camera, 
  Thermometer, 
  Scale, 
  Power, 
  RotateCw, 
  Settings2, 
  Wifi, 
  WifiOff, 
  Sliders, 
  Plus, 
  CheckCircle2, 
  AlertTriangle, 
  Activity, 
  Zap, 
  X, 
  Save, 
  ShieldCheck,
  Wind,
  Lightbulb
} from 'lucide-react';

// Dữ liệu giả lập danh sách thiết bị IoT trong trạm
const INITIAL_DEVICES = [
  { id: 'DEV-ESP32-01', name: 'ESP32 Main Gateway', type: 'Microcontroller', ip: '192.168.1.105', protocol: 'MQTT', status: 'Online', ping: '12ms', temp: '42°C', firm: 'v2.4.1' },
  { id: 'DEV-CAM-01', name: 'Camera AI ESP32-CAM', type: 'AI Vision Unit', ip: '192.168.1.106', protocol: 'RTSP/HTTP', status: 'Online', ping: '18ms', temp: '48°C', firm: 'v1.8.0' },
  { id: 'DEV-SENSOR-WT', name: 'Cảm biến Trọng lượng (HX711)', type: 'Loadcell Sensor', ip: 'GPI-22/23', protocol: 'I2C', status: 'Online', ping: '4ms', temp: '35°C', firm: 'v1.0.2' },
  { id: 'DEV-ENV-TH', name: 'Cảm biến Nhiệt độ / Độ ẩm (DHT22)', type: 'Environment Sensor', ip: 'GPI-14', protocol: 'OneWire', status: 'Online', ping: '5ms', temp: '33°C', firm: 'v1.0.0' },
  { id: 'DEV-[#2]-FAN', name: 'Quạt tản nhiệt tự động', type: 'Actuator Relays', ip: 'RELAY-01', protocol: 'GPIO', status: 'Offline', ping: 'N/A', temp: 'N/A', firm: 'v1.0.0' },
];

export default function Devices() {
  const [devices, setDevices] = useState(INITIAL_DEVICES);
  const [selectedDevice, setSelectedDevice] = useState(null); // Modal Cấu hình
  
  // Trạng thái các công tắc điều khiển trực tiếp (Toggles)
  const [controls, setControls] = useState({
    autoVentilation: true,
    cameraFlash: false,
    smartCompactor: true,
    aiAutoSorting: true
  });

  const toggleControl = (key) => {
    setControls(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleReboot = (deviceName) => {
    alert(`[Lệnh IoT] Đã gửi tín hiệu Khởi động lại (Reboot) tới thiết bị: ${deviceName}`);
  };

  return (
    <div className="p-6 space-y-6 w-full font-sans">
      
      {/* 1. HEADER TRANG */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-3 py-1 bg-[#bef264] text-slate-900 rounded-full text-[11px] font-black tracking-tight">
              HARDWARE & EDGE IOT
            </span>
            <span className="text-xs font-bold text-slate-400">Trạm điều khiển phần cứng</span>
          </div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">
            Quản lý Thiết bị IoT
          </h1>
          <p className="text-xs font-bold text-slate-400 mt-1">
            Giám sát trạng thái kết nối, cảm biến và điều khiển các chấp hành trực tiếp
          </p>
        </div>

        <button 
          onClick={() => alert("Đang quét tìm thiết bị IoT mới trong mạng LAN...")}
          className="inline-flex items-center gap-2 bg-slate-900 hover:bg-black text-white font-black px-5 py-3.5 rounded-full shadow-lg transition hover:scale-105 active:scale-95"
        >
          <Plus size={18} className="text-[#bef264]" />
          <span>Thêm Thiết Bị Mới</span>
        </button>
      </div>

      {/* 2. THẺ TỔNG QUAN HỆ THỐNG PHẦN CỨNG */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 w-full">
        <div className="bg-white p-5 rounded-[32px] border border-slate-200/70 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-black text-slate-400 uppercase">Tổng Thiết Bị</span>
            <div className="text-3xl font-black text-slate-900 mt-1">{devices.length} <span className="text-sm text-slate-400 font-bold">mục</span></div>
          </div>
          <div className="p-3 bg-slate-100 rounded-2xl text-slate-800">
            <Cpu size={22} />
          </div>
        </div>

        <div className="bg-white p-5 rounded-[32px] border border-slate-200/70 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-black text-slate-400 uppercase">Trạng Thái Kết Nối</span>
            <div className="text-3xl font-black text-emerald-600 mt-1">4 Online</div>
          </div>
          <div className="p-3 bg-emerald-50 rounded-2xl text-emerald-600">
            <Wifi size={22} />
          </div>
        </div>

        <div className="bg-white p-5 rounded-[32px] border border-slate-200/70 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-black text-slate-400 uppercase">Tốc độ Tín hiệu</span>
            <div className="text-3xl font-black text-slate-900 mt-1">12 ms</div>
          </div>
          <div className="p-3 bg-sky-50 rounded-2xl text-sky-600">
            <Activity size={22} />
          </div>
        </div>

        <div className="bg-[#bef264] p-5 rounded-[32px] text-slate-900 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-black opacity-80 uppercase">MQTT Protocol</span>
            <div className="text-2xl font-black mt-1">Broker Active</div>
          </div>
          <span className="w-3 h-3 rounded-full bg-slate-900 animate-pulse" />
        </div>
      </div>

      {/* 3. BẢNG ĐIỀU KHIỂN NHANH TRỰC TIẾP (DIRECT ACTUATOR CONTROLS) */}
      <div className="bg-white p-6 rounded-[36px] border border-slate-200/70 shadow-sm space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="font-black text-slate-900 text-lg">Bảng Điều Khiển Công Tắc Trực Tiếp</h3>
            <p className="text-xs font-bold text-slate-400">Kích hoạt hoặc can thiệp lệnh phần cứng thời gian thực</p>
          </div>
          <span className="px-3 py-1 bg-slate-100 text-slate-700 rounded-full text-xs font-black">
            IoT Relay Sync
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-2">
          
          {/* công tắc 1 */}
          <div className="p-4 bg-slate-50/90 rounded-3xl border border-slate-200/60 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`p-2.5 rounded-2xl ${controls.autoVentilation ? 'bg-slate-900 text-[#bef264]' : 'bg-slate-200 text-slate-500'}`}>
                <Wind size={20} />
              </div>
              <div>
                <span className="text-xs font-black text-slate-900 block">Thông gió tự động</span>
                <span className="text-[10px] font-bold text-slate-400">{controls.autoVentilation ? 'Đang kích hoạt' : 'Đã Tắt'}</span>
              </div>
            </div>
            <button 
              onClick={() => toggleControl('autoVentilation')}
              className={`w-12 h-6 rounded-full transition-colors duration-200 p-1 relative ${controls.autoVentilation ? 'bg-slate-900' : 'bg-slate-300'}`}
            >
              <div className={`w-4 h-4 rounded-full bg-white transition-transform duration-200 ${controls.autoVentilation ? 'translate-x-6 bg-[#bef264]' : 'translate-x-0'}`} />
            </button>
          </div>

          {/* công tắc 2 */}
          <div className="p-4 bg-slate-50/90 rounded-3xl border border-slate-200/60 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`p-2.5 rounded-2xl ${controls.cameraFlash ? 'bg-slate-900 text-[#bef264]' : 'bg-slate-200 text-slate-500'}`}>
                <Lightbulb size={20} />
              </div>
              <div>
                <span className="text-xs font-black text-slate-900 block">Đèn Flash Camera</span>
                <span className="text-[10px] font-bold text-slate-400">{controls.cameraFlash ? 'Đang Bật' : 'Đã Tắt'}</span>
              </div>
            </div>
            <button 
              onClick={() => toggleControl('cameraFlash')}
              className={`w-12 h-6 rounded-full transition-colors duration-200 p-1 relative ${controls.cameraFlash ? 'bg-slate-900' : 'bg-slate-300'}`}
            >
              <div className={`w-4 h-4 rounded-full bg-white transition-transform duration-200 ${controls.cameraFlash ? 'translate-x-6 bg-[#bef264]' : 'translate-x-0'}`} />
            </button>
          </div>

          {/* công tắc 3 */}
          <div className="p-4 bg-slate-50/90 rounded-3xl border border-slate-200/60 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`p-2.5 rounded-2xl ${controls.smartCompactor ? 'bg-slate-900 text-[#bef264]' : 'bg-slate-200 text-slate-500'}`}>
                <Zap size={20} />
              </div>
              <div>
                <span className="text-xs font-black text-slate-900 block">Ép rác tự động</span>
                <span className="text-[10px] font-bold text-slate-400">{controls.smartCompactor ? 'Sẵn sàng' : 'Tạm dừng'}</span>
              </div>
            </div>
            <button 
              onClick={() => toggleControl('smartCompactor')}
              className={`w-12 h-6 rounded-full transition-colors duration-200 p-1 relative ${controls.smartCompactor ? 'bg-slate-900' : 'bg-slate-300'}`}
            >
              <div className={`w-4 h-4 rounded-full bg-white transition-transform duration-200 ${controls.smartCompactor ? 'translate-x-6 bg-[#bef264]' : 'translate-x-0'}`} />
            </button>
          </div>

          {/* công tắc 4 */}
          <div className="p-4 bg-slate-50/90 rounded-3xl border border-slate-200/60 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`p-2.5 rounded-2xl ${controls.aiAutoSorting ? 'bg-slate-900 text-[#bef264]' : 'bg-slate-200 text-slate-500'}`}>
                <Cpu size={20} />
              </div>
              <div>
                <span className="text-xs font-black text-slate-900 block">Servo gạt rác AI</span>
                <span className="text-[10px] font-bold text-slate-400">{controls.aiAutoSorting ? 'Hoạt động' : 'Tắt'}</span>
              </div>
            </div>
            <button 
              onClick={() => toggleControl('aiAutoSorting')}
              className={`w-12 h-6 rounded-full transition-colors duration-200 p-1 relative ${controls.aiAutoSorting ? 'bg-slate-900' : 'bg-slate-300'}`}
            >
              <div className={`w-4 h-4 rounded-full bg-white transition-transform duration-200 ${controls.aiAutoSorting ? 'translate-x-6 bg-[#bef264]' : 'translate-x-0'}`} />
            </button>
          </div>

        </div>
      </div>

      {/* 4. DANH SÁCH CHI TIẾT THIẾT BỊ PHẦN CỨNG */}
      <div className="bg-white p-6 rounded-[36px] border border-slate-200/70 shadow-sm space-y-5 w-full">
        <h3 className="font-black text-slate-900 text-lg">Danh Sách Thiết Bị Cảm Biến & Vi Điều Khiển</h3>

        <div className="overflow-x-auto w-full">
          <table className="w-full text-left border-collapse table-fixed">
            <thead>
              <tr className="text-[11px] font-black text-slate-400 uppercase tracking-wider border-b border-slate-100">
                <th className="pb-4 pl-2 w-[14%]">MÃ THIẾT BỊ</th>
                <th className="pb-4 w-[20%]">TÊN THIẾT BỊ</th>
                <th className="pb-4 w-[16%]">LOẠI MODULE</th>
                <th className="pb-4 w-[14%]">ĐỊA CHỈ / IP</th>
                <th className="pb-4 w-[12%]">GIAO THỨC</th>
                <th className="pb-4 w-[12%]">TRẠNG THÁI</th>
                <th className="pb-4 text-right pr-2 w-[12%]">THAO TÁC</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100/80 text-xs font-bold text-slate-700">
              {devices.map((device) => (
                <tr key={device.id} className="hover:bg-slate-50/80 transition duration-150 group">
                  <td className="py-4 pl-2 font-mono font-black text-slate-900">{device.id}</td>
                  <td className="py-4 font-black text-slate-900">{device.name}</td>
                  <td className="py-4 text-slate-500 font-medium">{device.type}</td>
                  <td className="py-4 font-mono text-slate-600">{device.ip}</td>
                  <td className="py-4 font-mono text-xs text-slate-500">
                    <span className="px-2.5 py-1 bg-slate-100 rounded-lg text-slate-800 font-bold">{device.protocol}</span>
                  </td>
                  <td className="py-4">
                    {device.status === 'Online' ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#d9f99d] text-slate-900 rounded-full text-xs font-black">
                        <CheckCircle2 size={12} className="text-lime-700" /> Online
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-rose-100 text-rose-900 rounded-full text-xs font-black">
                        <AlertTriangle size={12} className="text-rose-600" /> Offline
                      </span>
                    )}
                  </td>
                  <td className="py-4 text-right pr-2">
                    <div className="flex justify-end gap-1">
                      <button 
                        onClick={() => handleReboot(device.name)} 
                        title="Khởi động lại ESP32" 
                        className="p-2 hover:bg-slate-100 text-slate-500 rounded-full transition"
                      >
                        <RotateCw size={16} />
                      </button>
                      <button 
                        onClick={() => setSelectedDevice(device)} 
                        title="Cấu hình tham số" 
                        className="p-2 hover:bg-slate-900 hover:text-white text-slate-700 rounded-full transition"
                      >
                        <Settings2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 5. MODAL CẤU HÌNH THAM SỐ THIẾT BỊ */}
      {selectedDevice && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white w-full max-w-md p-6 rounded-[36px] shadow-2xl border border-slate-100 space-y-5">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <div className="p-2.5 bg-[#d9f99d] text-slate-900 rounded-2xl">
                  <Sliders size={18} />
                </div>
                <h3 className="font-black text-slate-900 text-lg">Cấu Hình [{selectedDevice.id}]</h3>
              </div>
              <button onClick={() => setSelectedDevice(null)} className="p-2 text-slate-400 hover:text-slate-600">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={(e) => { e.preventDefault(); alert("Đã lưu cấu hình thiết bị thành công!"); setSelectedDevice(null); }} className="space-y-4">
              <div>
                <label className="block text-xs font-black text-slate-700 mb-1">Tên Thiết Bị</label>
                <input 
                  type="text" 
                  defaultValue={selectedDevice.name} 
                  className="w-full bg-slate-100/90 px-4 py-3 rounded-2xl text-xs font-bold text-slate-800 outline-none border border-slate-200/50"
                />
              </div>

              <div>
                <label className="block text-xs font-black text-slate-700 mb-1">Địa chỉ IP / Pin GPIO</label>
                <input 
                  type="text" 
                  defaultValue={selectedDevice.ip} 
                  className="w-full bg-slate-100/90 px-4 py-3 rounded-2xl text-xs font-bold text-slate-800 outline-none border border-slate-200/50"
                />
              </div>

              <div>
                <label className="block text-xs font-black text-slate-700 mb-1">Chu kỳ đọc dữ liệu (Telemetry Interval)</label>
                <select className="w-full bg-slate-100/90 px-4 py-3 rounded-2xl text-xs font-bold text-slate-800 outline-none border border-slate-200/50">
                  <option value="1000">1 Giây (Realtime)</option>
                  <option value="3000">3 Giây (Mặc định)</option>
                  <option value="5000">5 Giây</option>
                  <option value="10000">10 Giây (Tiết kiệm năng lượng)</option>
                </select>
              </div>

              <div className="flex gap-2 pt-2">
                <button 
                  type="button" 
                  onClick={() => setSelectedDevice(null)} 
                  className="flex-1 py-3.5 bg-slate-100 text-slate-600 rounded-2xl text-xs font-bold hover:bg-slate-200 transition"
                >
                  Hủy bỏ
                </button>
                <button 
                  type="submit" 
                  className="flex-1 py-3.5 bg-slate-900 text-[#bef264] rounded-2xl text-xs font-black hover:bg-black transition shadow-lg"
                >
                  Lưu Cấu Hình
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}