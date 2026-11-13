import React, { useState } from 'react';
import { 
  Database, 
  Search, 
  Filter, 
  Download, 
  Sparkles, 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  HelpCircle, 
  Eye, 
  Edit3, 
  ChevronLeft, 
  ChevronRight,
  RefreshCw,
  X,
  Tag,
  Scale,
  ShieldAlert
} from 'lucide-react';

// Dữ liệu giả lập nhật ký camera AI quét rác
const INITIAL_LOGS = [
  { id: 'LOG-8901', time: '22/10/2026 09:12:15', ai_type: 'Hữu Cơ', confidence: 96.8, weight: 2.4, household_id: 'HG-2026-001', image_url: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=300&auto=format&fit=crop&q=80', status: 'Verified' },
  { id: 'LOG-8902', time: '22/10/2026 09:08:40', ai_type: 'Nhựa / Tái chế', confidence: 91.2, weight: 1.8, household_id: 'HG-2026-004', image_url: 'https://images.unsplash.com/photo-1611284446314-60a58ac0deb9?w=300&auto=format&fit=crop&q=80', status: 'Verified' },
  { id: 'LOG-8903', time: '22/10/2026 08:55:02', ai_type: 'Không xác định', confidence: 62.4, weight: 3.5, household_id: 'HG-2026-002', image_url: 'https://images.unsplash.com/photo-1530587191325-3db32d826c18?w=300&auto=format&fit=crop&q=80', status: 'Needs_Review' },
  { id: 'LOG-8904', time: '22/10/2026 08:42:19', ai_type: 'Rác Khác', confidence: 88.5, weight: 4.1, household_id: 'HG-2026-005', image_url: 'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?w=300&auto=format&fit=crop&q=80', status: 'Verified' },
  { id: 'LOG-8905', time: '22/10/2026 08:30:10', ai_type: 'Hữu Cơ', confidence: 98.1, weight: 1.2, household_id: 'HG-2026-001', image_url: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=300&auto=format&fit=crop&q=80', status: 'Verified' },
  { id: 'LOG-8906', time: '22/10/2026 08:15:33', ai_type: 'Nhựa / Tái chế', confidence: 68.9, weight: 0.9, household_id: 'HG-2026-003', image_url: 'https://images.unsplash.com/photo-1611284446314-60a58ac0deb9?w=300&auto=format&fit=crop&q=80', status: 'Needs_Review' },
];

export default function Logs() {
  const [logs, setLogs] = useState(INITIAL_LOGS);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('All');
  const [selectedLog, setSelectedLog] = useState(null); // State xem Modal Chi tiết
  const [editLog, setEditLog] = useState(null); // State Modal Gán nhãn lại

  // Lọc dữ liệu
  const filteredLogs = logs.filter(log => {
    const matchesSearch = log.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          log.household_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          log.ai_type.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === 'All' || log.ai_type === typeFilter;
    return matchesSearch && matchesType;
  });

  // Hàm đổi loại rác thủ công (Re-labeling)
  const handleRelabel = (newType) => {
    if (!editLog) return;
    setLogs(logs.map(item => item.id === editLog.id ? { ...item, ai_type: newType, status: 'Verified', confidence: 100 } : item));
    setEditLog(null);
  };

  // Render badge phân loại
  const renderBadge = (type) => {
    switch (type) {
      case 'Hữu Cơ':
        return <span className="px-3 py-1 bg-[#d9f99d] text-slate-900 rounded-full text-xs font-black">🌱 Hữu Cơ</span>;
      case 'Nhựa / Tái chế':
        return <span className="px-3 py-1 bg-sky-100 text-sky-900 rounded-full text-xs font-black">♻️ Tái Chế</span>;
      case 'Rác Khác':
        return <span className="px-3 py-1 bg-slate-200 text-slate-800 rounded-full text-xs font-black">🗑️ Rác Khác</span>;
      default:
        return <span className="px-3 py-1 bg-amber-100 text-amber-900 rounded-full text-xs font-black">⚠️ Chưa xác định</span>;
    }
  };

  return (
    <div className="p-6 space-y-6 w-full font-sans">
      
      {/* 1. HEADER TRANG */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-3 py-1 bg-slate-900 text-[#bef264] rounded-full text-[11px] font-black tracking-tight">
              AI AUDIT CONSOLE
            </span>
            <span className="text-xs font-bold text-slate-400">Tra cứu & Kiểm duyệt nhận diện</span>
          </div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">
            Nhật ký Phân loại AI
          </h1>
          <p className="text-xs font-bold text-slate-400 mt-1">
            Lịch sử các lượt camera quét rác thực tế kèm ảnh chụp và độ tin cậy
          </p>
        </div>

        <button 
          onClick={() => alert("Đã xuất file báo cáo log_export_2026.csv thành công!")}
          className="inline-flex items-center gap-2 bg-slate-900 hover:bg-black text-white font-black px-5 py-3.5 rounded-full shadow-lg transition hover:scale-105 active:scale-95"
        >
          <Download size={18} className="text-[#bef264]" />
          <span>Xuất File Báo Cáo</span>
        </button>
      </div>

      {/* 2. THẺ CHỈ SỐ QUICK METRICS */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 w-full">
        <div className="bg-white p-5 rounded-[32px] border border-slate-200/70 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-black text-slate-400 uppercase">Tổng Lượt Quét</span>
            <div className="text-3xl font-black text-slate-900 mt-1">1,428</div>
          </div>
          <div className="p-3 bg-slate-100 rounded-2xl text-slate-800">
            <Database size={22} />
          </div>
        </div>

        <div className="bg-white p-5 rounded-[32px] border border-slate-200/70 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-black text-slate-400 uppercase">Độ Tin Cậy TB</span>
            <div className="text-3xl font-black text-emerald-600 mt-1">94.5%</div>
          </div>
          <div className="p-3 bg-emerald-50 rounded-2xl text-emerald-600">
            <Sparkles size={22} />
          </div>
        </div>

        <div className="bg-white p-5 rounded-[32px] border border-slate-200/70 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-black text-slate-400 uppercase">Cần Kiểm Duyệt</span>
            <div className="text-3xl font-black text-amber-600 mt-1">2 lượt</div>
          </div>
          <div className="p-3 bg-amber-50 rounded-2xl text-amber-600">
            <ShieldAlert size={22} />
          </div>
        </div>

        <div className="bg-[#bef264] p-5 rounded-[32px] text-slate-900 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-black opacity-80 uppercase">Trạng Thái Model</span>
            <div className="text-2xl font-black mt-1">ResNet-50 v2</div>
          </div>
          <span className="w-3 h-3 rounded-full bg-slate-900 animate-ping" />
        </div>
      </div>

      {/* 3. BỘ LỌC VÀ BẢNG LOGS */}
      <div className="bg-white p-6 rounded-[36px] border border-slate-200/70 shadow-sm space-y-5 w-full">
        
        <div className="flex flex-col md:flex-row gap-3 justify-between items-center">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-4 top-3.5 text-slate-400" size={16} />
            <input 
              type="text" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Tìm theo Mã Log, Mã Hộ..." 
              className="w-full bg-slate-100/90 pl-11 pr-4 py-3 rounded-full text-xs font-bold text-slate-800 placeholder-slate-400 outline-none border border-slate-200/50 focus:border-slate-900 transition"
            />
          </div>

          <div className="flex flex-wrap gap-2 w-full md:w-auto">
            <button onClick={() => setTypeFilter('All')} className={`px-4 py-2 rounded-full text-xs font-black ${typeFilter === 'All' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-500'}`}>Tất cả</button>
            <button onClick={() => setTypeFilter('Hữu Cơ')} className={`px-4 py-2 rounded-full text-xs font-black ${typeFilter === 'Hữu Cơ' ? 'bg-[#bef264] text-slate-900' : 'bg-slate-100 text-slate-500'}`}>Hữu Cơ</button>
            <button onClick={() => setTypeFilter('Nhựa / Tái chế')} className={`px-4 py-2 rounded-full text-xs font-black ${typeFilter === 'Nhựa / Tái chế' ? 'bg-sky-200 text-slate-900' : 'bg-slate-100 text-slate-500'}`}>Tái Chế</button>
            <button onClick={() => setTypeFilter('Rác Khác')} className={`px-4 py-2 rounded-full text-xs font-black ${typeFilter === 'Rác Khác' ? 'bg-slate-300 text-slate-900' : 'bg-slate-100 text-slate-500'}`}>Rác Khác</button>
          </div>
        </div>

        {/* BẢNG BÀN DỮ LIỆU */}
        <div className="overflow-x-auto w-full">
          <table className="w-full text-left border-collapse table-fixed">
            <thead>
              <tr className="text-[11px] font-black text-slate-400 uppercase tracking-wider border-b border-slate-100">
                <th className="pb-4 pl-2 w-[10%]">SẢN PHẨM</th>
                <th className="pb-4 w-[12%]">MÃ LOG</th>
                <th className="pb-4 w-[18%]">THỜI GIAN</th>
                <th className="pb-4 w-[14%]">MÃ HỘ GIA ĐÌNH</th>
                <th className="pb-4 w-[18%]">PHÂN LOẠI AI</th>
                <th className="pb-4 w-[14%]">ĐỘ TIN CẬY</th>
                <th className="pb-4 w-[10%]">KHỐI LƯỢNG</th>
                <th className="pb-4 text-right pr-2 w-[12%]">THAO TÁC</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100/80 text-xs font-bold text-slate-700">
              {filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50/80 transition duration-150 group">
                  <td className="py-3 pl-2">
                    <img src={log.image_url} alt="Snap" className="w-10 h-10 rounded-2xl object-cover ring-2 ring-slate-100" />
                  </td>
                  <td className="py-4 font-mono font-black text-slate-900">{log.id}</td>
                  <td className="py-4 text-slate-500 font-mono text-[11px]">{log.time}</td>
                  <td className="py-4 font-mono font-extrabold text-slate-800">{log.household_id}</td>
                  <td className="py-4">{renderBadge(log.ai_type)}</td>
                  <td className="py-4">
                    <div className="flex items-center gap-2">
                      <span className={`font-black ${log.confidence < 75 ? 'text-amber-600' : 'text-slate-900'}`}>{log.confidence}%</span>
                      {log.confidence < 75 && <span className="text-[10px] bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded font-black">Cần duyệt</span>}
                    </div>
                  </td>
                  <td className="py-4 font-mono font-black text-slate-900">{log.weight} kg</td>
                  <td className="py-4 text-right pr-2">
                    <div className="flex justify-end gap-1">
                      <button onClick={() => setSelectedLog(log)} title="Xem chi tiết" className="p-2 hover:bg-slate-100 text-slate-500 rounded-full transition">
                        <Eye size={16} />
                      </button>
                      <button onClick={() => setEditLog(log)} title="Gán nhãn lại AI" className="p-2 hover:bg-amber-50 text-amber-600 rounded-full transition">
                        <Edit3 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </div>

      {/* MODAL 1: XEM CHI TIẾT KẾT QUẢ AI */}
      {selectedLog && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white w-full max-w-lg p-6 rounded-[36px] shadow-2xl border border-slate-100 space-y-5">
            <div className="flex justify-between items-center">
              <h3 className="font-black text-slate-900 text-lg">Chi Tiết Quét AI [{selectedLog.id}]</h3>
              <button onClick={() => setSelectedLog(null)} className="p-2 text-slate-400 hover:text-slate-600"><X size={18} /></button>
            </div>

            <div className="space-y-4">
              <div className="w-full h-56 rounded-3xl overflow-hidden relative border border-slate-200">
                <img src={selectedLog.image_url} alt="Main Snapshot" className="w-full h-full object-cover" />
                <div className="absolute top-3 right-3 bg-slate-900/80 backdrop-blur-md text-[#bef264] px-3 py-1 rounded-full text-xs font-black">
                  AI Confidence: {selectedLog.confidence}%
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-slate-50 rounded-2xl">
                  <span className="text-slate-400 font-bold">Chủ hộ sở hữu</span>
                  <div className="text-slate-900 font-black mt-0.5">{selectedLog.household_id}</div>
                </div>
                <div className="p-3 bg-slate-50 rounded-2xl">
                  <span className="text-slate-400 font-bold">Trọng lượng rác</span>
                  <div className="text-slate-900 font-black mt-0.5">{selectedLog.weight} kg</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: GÁN NHÃN LẠI THỦ CÔNG (RE-LABELING) */}
      {editLog && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white w-full max-w-md p-6 rounded-[36px] shadow-2xl border border-slate-100 space-y-5">
            <div className="flex justify-between items-center">
              <h3 className="font-black text-slate-900 text-lg">Điều Chỉnh Nhãn AI</h3>
              <button onClick={() => setEditLog(null)} className="p-2 text-slate-400 hover:text-slate-600"><X size={18} /></button>
            </div>

            <p className="text-xs font-bold text-slate-400">
              Chọn nhãn chính xác cho mã log <span className="text-slate-900">{editLog.id}</span> để giúp hệ thống AI học lại:
            </p>

            <div className="grid grid-cols-1 gap-2">
              <button onClick={() => handleRelabel('Hữu Cơ')} className="p-3 bg-slate-50 hover:bg-[#d9f99d] text-slate-900 rounded-2xl text-xs font-black text-left transition">🌱 Hữu Cơ</button>
              <button onClick={() => handleRelabel('Nhựa / Tái chế')} className="p-3 bg-slate-50 hover:bg-sky-100 text-slate-900 rounded-2xl text-xs font-black text-left transition">♻️ Nhựa / Tái chế</button>
              <button onClick={() => handleRelabel('Rác Khác')} className="p-3 bg-slate-50 hover:bg-slate-200 text-slate-900 rounded-2xl text-xs font-black text-left transition">🗑️ Rác Khác</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}