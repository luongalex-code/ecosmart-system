import React, { useState } from 'react';
import { 
  Settings as SettingsIcon, 
  Sliders, 
  Cpu, 
  Bell, 
  ShieldCheck, 
  Save, 
  Clock, 
  HardDrive, 
  Users, 
  FileText, 
  Volume2, 
  CheckCircle2, 
  Thermometer, 
  Trash2, 
  Bot, 
  Key, 
  RefreshCw, 
  Plus, 
  Trash, 
  Download, 
  Upload, 
  Zap, 
  ShieldAlert, 
  Eye
} from 'lucide-react';

export default function Settings() {
  const [activeTab, setActiveTab] = useState('system');
  const [isSaved, setIsSaved] = useState(false);

  // State lưu trữ cấu hình hệ thống
  const [settings, setSettings] = useState({
    stationName: 'Trạm Xử Lý Rác AI Số 1 - TP. Thủ Dầu Một',
    maxTempThreshold: 35,
    maxCapacityThreshold: 85,
    audioSiren: true,
    aiConfidenceMin: 75,
    autoSaveSnapshot: true,
    modelName: 'ResNet50_EcoSmart_v2.4.tflite',
    telegramToken: '5892019481:AAEv_x9Z1...',
    telegramChatId: '-10018920192',
    enableEmailAlert: true,
    adminEmail: 'admin.ecosmart@tdmu.edu.vn',
    apiKey: 'ecosmart_live_sec_89012839102839012',
    backupFrequency: 'Daily',
    retentionDays: 30,
    startTime: '06:00',
    endTime: '22:00',
  });

  // Danh sách tài khoản phân quyền (RBAC)
  const [users, setUsers] = useState([
    { id: 1, name: 'Lê Quý Đôn', email: 'don.lq@ecosmart.vn', role: 'System Admin', status: 'Active' },
    { id: 2, name: 'Nguyễn Văn B', email: 'b.nguyen@ecosmart.vn', role: 'Operator', status: 'Active' },
    { id: 3, name: 'Trần Thị C', email: 'c.tran@ecosmart.vn', role: 'Viewer', status: 'Inactive' },
  ]);

  // Lịch sử thao tác hệ thống (Audit Logs)
  const auditLogs = [
    { id: 'LOG-ADM-01', user: 'Lê Quý Đôn', action: 'Thay đổi ngưỡng nhiệt độ cảnh báo (30°C -> 35°C)', time: '22/10/2026 08:30:12' },
    { id: 'LOG-ADM-02', user: 'Nguyễn Văn B', action: 'Kích hoạt công tắc Quạt thông gió thủ công', time: '21/10/2026 15:45:00' },
    { id: 'LOG-ADM-03', user: 'System Auto', action: 'Sao lưu dữ liệu tự động database_backup_20261020.json', time: '20/10/2026 00:00:00' },
  ];

  const handleSave = (e) => {
    e.preventDefault();
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  return (
    <div className="p-6 space-y-6 w-full font-sans">
      
      {/* 1. HEADER TRANG */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-3 py-1 bg-[#bef264] text-slate-900 rounded-full text-[11px] font-black tracking-tight">
              ADVANCED SYSTEM CONTROL
            </span>
            <span className="text-xs font-bold text-slate-400">Trung tâm cấu hình toàn diện</span>
          </div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">
            Cài đặt Hệ thống
          </h1>
          <p className="text-xs font-bold text-slate-400 mt-1">
            Quản lý ngưỡng IoT, AI, lịch vận hành, phân quyền tài khoản và sao lưu dữ liệu
          </p>
        </div>

        <button 
          onClick={handleSave}
          className="inline-flex items-center gap-2 bg-slate-900 hover:bg-black text-[#bef264] font-black px-6 py-3.5 rounded-full shadow-lg transition hover:scale-105 active:scale-95"
        >
          <Save size={18} />
          <span>Lưu Tất Cả Cấu Hình</span>
        </button>
      </div>

      {/* THÔNG BÁO LƯU THÀNH CÔNG */}
      {isSaved && (
        <div className="p-4 bg-[#d9f99d] text-slate-900 rounded-2xl border border-lime-300 font-black text-xs flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
          <CheckCircle2 size={18} className="text-lime-700" />
          <span>Đã cập nhật toàn bộ tham số cài đặt hệ thống thành công!</span>
        </div>
      )}

      {/* 2. CHUYỂN TAB CÀI ĐẶT (MỞ RỘNG 7 TABS CAPSULES) */}
      <div className="flex flex-wrap gap-2">
        <button onClick={() => setActiveTab('system')} className={`inline-flex items-center gap-2 px-5 py-3 rounded-full text-xs font-black transition ${activeTab === 'system' ? 'bg-slate-900 text-white shadow-md' : 'bg-white text-slate-600 hover:bg-slate-100'}`}>
          <Sliders size={16} /> <span>Ngưỡng Vận Hành IoT</span>
        </button>
        <button onClick={() => setActiveTab('schedule')} className={`inline-flex items-center gap-2 px-5 py-3 rounded-full text-xs font-black transition ${activeTab === 'schedule' ? 'bg-slate-900 text-white shadow-md' : 'bg-white text-slate-600 hover:bg-slate-100'}`}>
          <Clock size={16} /> <span>Lịch Tự Động</span>
        </button>
        <button onClick={() => setActiveTab('ai')} className={`inline-flex items-center gap-2 px-5 py-3 rounded-full text-xs font-black transition ${activeTab === 'ai' ? 'bg-slate-900 text-white shadow-md' : 'bg-white text-slate-100 hover:bg-slate-100'}`}>
          <Cpu size={16} /> <span>Mô Hình AI</span>
        </button>
        <button onClick={() => setActiveTab('alerts')} className={`inline-flex items-center gap-2 px-5 py-3 rounded-full text-xs font-black transition ${activeTab === 'alerts' ? 'bg-slate-900 text-white shadow-md' : 'bg-white text-slate-600 hover:bg-slate-100'}`}>
          <Bell size={16} /> <span>Telegram & Thông Báo</span>
        </button>
        <button onClick={() => setActiveTab('backup')} className={`inline-flex items-center gap-2 px-5 py-3 rounded-full text-xs font-black transition ${activeTab === 'backup' ? 'bg-slate-900 text-white shadow-md' : 'bg-white text-slate-600 hover:bg-slate-100'}`}>
          <HardDrive size={16} /> <span>Sao Lưu Dữ Liệu</span>
        </button>
        <button onClick={() => setActiveTab('users')} className={`inline-flex items-center gap-2 px-5 py-3 rounded-full text-xs font-black transition ${activeTab === 'users' ? 'bg-slate-900 text-white shadow-md' : 'bg-white text-slate-600 hover:bg-slate-100'}`}>
          <Users size={16} /> <span>Phân Quyền User</span>
        </button>
        <button onClick={() => setActiveTab('audit')} className={`inline-flex items-center gap-2 px-5 py-3 rounded-full text-xs font-black transition ${activeTab === 'audit' ? 'bg-slate-900 text-white shadow-md' : 'bg-white text-slate-600 hover:bg-slate-100'}`}>
          <FileText size={16} /> <span>Lịch Sử Nhật Ký</span>
        </button>
      </div>

      {/* 3. NỘI DUNG FORM CHÍNH */}
      <div className="bg-white p-8 rounded-[36px] border border-slate-200/70 shadow-sm w-full">
        <form onSubmit={handleSave} className="space-y-6 max-w-4xl">
          
          {/* TAB 1: NGƯỠNG VẬN HÀNH IOT & CÒI CẢNH BÁO */}
          {activeTab === 'system' && (
            <div className="space-y-5 animate-in fade-in duration-200">
              <h3 className="font-black text-slate-900 text-xl mb-4 border-b pb-3 border-slate-100">
                Cấu Hình Trạm & Ngưỡng Cảnh Báo Phần Cứng
              </h3>

              <div>
                <label className="block text-xs font-black text-slate-700 mb-1">Tên Trạm Vận Hành Chi Tiết</label>
                <input 
                  type="text" 
                  value={settings.stationName}
                  onChange={(e) => setSettings({...settings, stationName: e.target.value})}
                  className="w-full bg-slate-100/90 px-4 py-3 rounded-2xl text-xs font-bold text-slate-800 outline-none border border-slate-200/50 focus:border-slate-900"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                <div className="p-4 bg-slate-50/90 rounded-2xl border border-slate-200/50 space-y-2">
                  <div className="flex items-center gap-2 text-rose-600 font-extrabold text-xs">
                    <Thermometer size={16} />
                    <span>Ngưỡng Nhiệt Độ Cảnh Báo (°C)</span>
                  </div>
                  <input 
                    type="number" 
                    value={settings.maxTempThreshold}
                    onChange={(e) => setSettings({...settings, maxTempThreshold: Number(e.target.value)})}
                    className="w-full bg-white px-4 py-2.5 rounded-xl text-sm font-black text-slate-900 border border-slate-200"
                  />
                  <p className="text-[10px] text-slate-400 font-bold">Vượt quá ngưỡng này hệ thống sẽ phát còi & kích quạt thông gió.</p>
                </div>

                <div className="p-4 bg-slate-50/90 rounded-2xl border border-slate-200/50 space-y-2">
                  <div className="flex items-center gap-2 text-amber-600 font-extrabold text-xs">
                    <Trash2 size={16} />
                    <span>Ngưỡng Báo Đầy Thùng Rác (%)</span>
                  </div>
                  <input 
                    type="number" 
                    value={settings.maxCapacityThreshold}
                    onChange={(e) => setSettings({...settings, maxCapacityThreshold: Number(e.target.value)})}
                    className="w-full bg-white px-4 py-2.5 rounded-xl text-sm font-black text-slate-900 border border-slate-200"
                  />
                  <p className="text-[10px] text-slate-400 font-bold">Tự động phát thông báo cho xe thu gom rác đến dọn.</p>
                </div>
              </div>

              <div className="p-4 bg-slate-50/90 rounded-2xl border border-slate-200/50 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-amber-100 text-amber-800 rounded-xl">
                    <Volume2 size={18} />
                  </div>
                  <div>
                    <span className="text-xs font-black text-slate-900 block">Còi Cảnh Báo Báo Động Tại Trạm (Audio Siren)</span>
                    <span className="text-[10px] font-bold text-slate-400">Kích hoạt loa còi báo khi xảy ra sự cố cháy nổ hoặc quá nhiệt</span>
                  </div>
                </div>
                <input 
                  type="checkbox" 
                  checked={settings.audioSiren}
                  onChange={(e) => setSettings({...settings, audioSiren: e.target.checked})}
                  className="w-5 h-5 accent-slate-900 rounded cursor-pointer"
                />
              </div>
            </div>
          )}

          {/* TAB 2: LỊCH TRÌNH VẬN HÀNH TỰ ĐỘNG */}
          {activeTab === 'schedule' && (
            <div className="space-y-5 animate-in fade-in duration-200">
              <h3 className="font-black text-slate-900 text-xl mb-4 border-b pb-3 border-slate-100">
                Lịch Trình Vận Hành Tự Động Cho Trạm
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-slate-50/90 rounded-2xl border border-slate-200/50 space-y-2">
                  <label className="block text-xs font-black text-slate-700">Giờ Bật Hệ Thống AI & Camera</label>
                  <input 
                    type="time" 
                    value={settings.startTime}
                    onChange={(e) => setSettings({...settings, startTime: e.target.value})}
                    className="w-full bg-white px-4 py-2.5 rounded-xl text-sm font-black text-slate-900 border border-slate-200"
                  />
                </div>

                <div className="p-4 bg-slate-50/90 rounded-2xl border border-slate-200/50 space-y-2">
                  <label className="block text-xs font-black text-slate-700">Giờ Chuyển Sang Chế Độ Chờ (Sleep Mode)</label>
                  <input 
                    type="time" 
                    value={settings.endTime}
                    onChange={(e) => setSettings({...settings, endTime: e.target.value})}
                    className="w-full bg-white px-4 py-2.5 rounded-xl text-sm font-black text-slate-900 border border-slate-200"
                  />
                </div>
              </div>

              <div className="p-4 bg-slate-50/90 rounded-2xl border border-slate-200/50 space-y-2">
                <span className="text-xs font-black text-slate-900 block">Chu Kỳ Ép Rác Tự Động (Compactor Interval)</span>
                <select className="w-full bg-white px-4 py-3 rounded-xl text-xs font-bold text-slate-800 border border-slate-200">
                  <option value="30">Mỗi 30 phút một lần</option>
                  <option value="60">Mỗi 1 tiếng một lần (Mặc định)</option>
                  <option value="120">Mỗi 2 tiếng một lần</option>
                </select>
              </div>
            </div>
          )}

          {/* TAB 3: MÔ HÌNH AI */}
          {activeTab === 'ai' && (
            <div className="space-y-5 animate-in fade-in duration-200">
              <h3 className="font-black text-slate-900 text-xl mb-4 border-b pb-3 border-slate-100">
                Tham Số Mô Hình AI ResNet / MobileNet
              </h3>

              <div>
                <label className="block text-xs font-black text-slate-700 mb-1">Phiên Bản Model AI Đang Chạy</label>
                <select 
                  value={settings.modelName}
                  onChange={(e) => setSettings({...settings, modelName: e.target.value})}
                  className="w-full bg-slate-100/90 px-4 py-3 rounded-2xl text-xs font-bold text-slate-800 outline-none border border-slate-200/50"
                >
                  <option value="ResNet50_EcoSmart_v2.4.tflite">ResNet50 EcoSmart v2.4 (Khuyên dùng - Độ chính xác 98%)</option>
                  <option value="MobileNetV3_Fast_v1.0.tflite">MobileNetV3 Fast v1.0 (Tốc độ cao - Dành cho thiết bị yếu)</option>
                  <option value="YOLOv8_Custom_Waste.pt">YOLOv8 Custom Waste Detection (Đa mục tiêu)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-black text-slate-700 mb-1">Ngưỡng Độ Tin Cậy Tối Thiểu (Confidence Cutoff: {settings.aiConfidenceMin}%)</label>
                <input 
                  type="range" 
                  min="50" 
                  max="95" 
                  value={settings.aiConfidenceMin}
                  onChange={(e) => setSettings({...settings, aiConfidenceMin: Number(e.target.value)})}
                  className="w-full accent-slate-900 h-2 bg-slate-200 rounded-lg cursor-pointer"
                />
              </div>

              <div className="p-4 bg-slate-50/90 rounded-2xl border border-slate-200/50 flex items-center justify-between">
                <div>
                  <span className="text-xs font-black text-slate-900 block">Tự Động Lưu Ảnh Camera Snapshot</span>
                  <span className="text-[10px] font-bold text-slate-400">Lưu lại toàn bộ ảnh quét để phục vụ huấn luyện lại AI</span>
                </div>
                <input 
                  type="checkbox" 
                  checked={settings.autoSaveSnapshot}
                  onChange={(e) => setSettings({...settings, autoSaveSnapshot: e.target.checked})}
                  className="w-5 h-5 accent-slate-900 rounded cursor-pointer"
                />
              </div>
            </div>
          )}

          {/* TAB 4: TELEGRAM & THÔNG BÁO */}
          {activeTab === 'alerts' && (
            <div className="space-y-5 animate-in fade-in duration-200">
              <h3 className="font-black text-slate-900 text-xl mb-4 border-b pb-3 border-slate-100">
                Tích Hợp Bot Cảnh Báo Telegram & Email
              </h3>

              <div className="p-4 bg-slate-50/90 rounded-2xl border border-slate-200/50 space-y-3">
                <div className="flex items-center gap-2 text-slate-900 font-black text-xs">
                  <Bot size={18} className="text-sky-600" />
                  <span>Telegram Bot Cảnh Báo Realtime</span>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-500 mb-1">Bot Token ID</label>
                  <input 
                    type="text" 
                    value={settings.telegramToken}
                    onChange={(e) => setSettings({...settings, telegramToken: e.target.value})}
                    className="w-full bg-white px-4 py-2.5 rounded-xl text-xs font-mono font-bold text-slate-800 border border-slate-200"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-500 mb-1">Group / Chat ID Nhận Tin Báo Sự Cố</label>
                  <input 
                    type="text" 
                    value={settings.telegramChatId}
                    onChange={(e) => setSettings({...settings, telegramChatId: e.target.value})}
                    className="w-full bg-white px-4 py-2.5 rounded-xl text-xs font-mono font-bold text-slate-800 border border-slate-200"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-black text-slate-700 mb-1">Email Nhận Báo Cáo Định Kỳ</label>
                <input 
                  type="email" 
                  value={settings.adminEmail}
                  onChange={(e) => setSettings({...settings, adminEmail: e.target.value})}
                  className="w-full bg-slate-100/90 px-4 py-3 rounded-2xl text-xs font-bold text-slate-800 outline-none border border-slate-200/50"
                />
              </div>
            </div>
          )}

          {/* TAB 5: SAO LƯU DỮ LIỆU */}
          {activeTab === 'backup' && (
            <div className="space-y-5 animate-in fade-in duration-200">
              <h3 className="font-black text-slate-900 text-xl mb-4 border-b pb-3 border-slate-100">
                Sao Lưu & Dọn Dẹp Cơ Sở Dữ Liệu
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-slate-50/90 rounded-2xl border border-slate-200/50 space-y-2">
                  <span className="text-xs font-black text-slate-900 block">Tần Suất Sao Lưu Tự Động</span>
                  <select 
                    value={settings.backupFrequency}
                    onChange={(e) => setSettings({...settings, backupFrequency: e.target.value})}
                    className="w-full bg-white px-4 py-2.5 rounded-xl text-xs font-bold text-slate-800 border border-slate-200"
                  >
                    <option value="Daily">Hàng ngày (Daily at 00:00)</option>
                    <option value="Weekly">Hàng tuần (Weekly)</option>
                    <option value="Monthly">Hàng tháng (Monthly)</option>
                  </select>
                </div>

                <div className="p-4 bg-slate-50/90 rounded-2xl border border-slate-200/50 space-y-2">
                  <span className="text-xs font-black text-slate-900 block">Thời Gian Lưu Ảnh Snapshot (Ngày)</span>
                  <input 
                    type="number" 
                    value={settings.retentionDays}
                    onChange={(e) => setSettings({...settings, retentionDays: Number(e.target.value)})}
                    className="w-full bg-white px-4 py-2.5 rounded-xl text-xs font-black text-slate-900 border border-slate-200"
                  />
                  <p className="text-[10px] text-slate-400 font-bold">Tự động xóa ảnh cũ quá số ngày để tiết kiệm dung lượng đĩa.</p>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button 
                  type="button" 
                  onClick={() => alert("Đã tải xuống file database_backup.json!")}
                  className="inline-flex items-center gap-2 px-5 py-3 bg-slate-900 text-white rounded-2xl text-xs font-black hover:bg-black transition"
                >
                  <Download size={16} /> <span>Tải Bản Sao Lưu Ngay</span>
                </button>
                <button 
                  type="button" 
                  onClick={() => alert("Mở trình tải file khôi phục...")}
                  className="inline-flex items-center gap-2 px-5 py-3 bg-slate-100 text-slate-700 rounded-2xl text-xs font-black hover:bg-slate-200 transition"
                >
                  <Upload size={16} /> <span>Khôi Phục Dữ Liệu</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 6: PHÂN QUYỀN USER (RBAC) */}
          {activeTab === 'users' && (
            <div className="space-y-5 animate-in fade-in duration-200">
              <div className="flex justify-between items-center border-b pb-3 border-slate-100">
                <h3 className="font-black text-slate-900 text-xl">Quản Lý Quyền Bổ Nhân Viên Vận Hành</h3>
                <button 
                  type="button" 
                  onClick={() => {
                    const name = prompt("Nhập tên nhân viên:");
                    if (name) setUsers([...users, { id: Date.now(), name, email: `${name.toLowerCase().replace(/\s+/g, '')}@ecosmart.vn`, role: 'Operator', status: 'Active' }]);
                  }}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-900 text-[#bef264] rounded-full text-xs font-black"
                >
                  <Plus size={14} /> <span>Thêm User Mới</span>
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="text-[11px] font-black text-slate-400 uppercase tracking-wider border-b border-slate-100">
                      <th className="pb-3">HỌ VÀ TÊN</th>
                      <th className="pb-3">EMAIL</th>
                      <th className="pb-3">VAI TRÒ</th>
                      <th className="pb-3 text-right">THAO TÁC</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs font-bold text-slate-800">
                    {users.map(u => (
                      <tr key={u.id}>
                        <td className="py-3.5 font-black">{u.name}</td>
                        <td className="py-3.5 font-mono text-slate-500">{u.email}</td>
                        <td className="py-3.5">
                          <span className="px-3 py-1 bg-slate-100 rounded-full text-[11px] font-black">{u.role}</span>
                        </td>
                        <td className="py-3.5 text-right">
                          <button 
                            type="button"
                            onClick={() => setUsers(users.filter(x => x.id !== u.id))}
                            className="p-1.5 hover:bg-rose-50 text-rose-600 rounded-lg transition"
                          >
                            <Trash size={16} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 7: LỊCH SỬ NHẬT KÝ THAO TÁC */}
          {activeTab === 'audit' && (
            <div className="space-y-5 animate-in fade-in duration-200">
              <h3 className="font-black text-slate-900 text-xl mb-4 border-b pb-3 border-slate-100">
                Lịch Sử Nhật Ký Thao Tác Hệ Thống (Audit Logs)
              </h3>

              <div className="space-y-2">
                {auditLogs.map(log => (
                  <div key={log.id} className="p-4 bg-slate-50/90 rounded-2xl border border-slate-200/50 flex justify-between items-center text-xs font-bold">
                    <div>
                      <span className="font-black text-slate-900 block">{log.action}</span>
                      <span className="text-[10px] text-slate-400">Thực hiện bởi: {log.user}</span>
                    </div>
                    <span className="font-mono text-[11px] text-slate-500">{log.time}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="pt-4 border-t border-slate-100 flex justify-end">
            <button 
              type="submit"
              className="px-8 py-3.5 bg-slate-900 hover:bg-black text-[#bef264] font-black rounded-2xl shadow-lg transition hover:scale-105 active:scale-95"
            >
              Lưu Thay Đổi
            </button>
          </div>

        </form>
      </div>

    </div>
  );
}