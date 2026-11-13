import React, { useState } from 'react';
import { 
  Search, 
  Plus, 
  Filter, 
  MoreVertical, 
  CheckCircle2, 
  AlertTriangle, 
  Info, 
  ChevronLeft, 
  ChevronRight,
  Users,
  Award,
  Trash2,
  X,
  UserPlus,
  Sparkles,
  TrendingUp,
  ShieldCheck,
  Calendar,
  Zap
} from 'lucide-react';

const INITIAL_HOUSEHOLDS = [
  { id: 'HG-2026-001', name: 'Nguyễn Văn An', address: '123 Đường Số 1, Quận 2', complianceRate: 98, lastCollection: '21/10/2026 08:30', totalWeightMonth: 45, status: 'Active' },
  { id: 'HG-2026-002', name: 'Trần Thị Bé', address: '45A Phố Hàng Bài, Hoàn Kiếm', complianceRate: 65, lastCollection: '20/10/2026 09:15', totalWeightMonth: 62, status: 'Active' },
  { id: 'HG-2026-003', name: 'Lê Hoàng Cường', address: '88 Nguyễn Đình Chiểu, Quận 3', complianceRate: 85, lastCollection: '19/10/2026 07:45', totalWeightMonth: 30, status: 'Inactive' },
  { id: 'HG-2026-004', name: 'Phạm Minh Đức', address: '12 Lê Lợi, Thủ Dầu Một', complianceRate: 92, lastCollection: '21/10/2026 10:00', totalWeightMonth: 58, status: 'Active' },
  { id: 'HG-2026-005', name: 'Vũ Thị Hồng', address: '56 Trần Hưng Đạo, Quận 1', complianceRate: 54, lastCollection: '18/10/2026 14:20', totalWeightMonth: 41, status: 'Active' },
];

export default function Households() {
  const [households, setHouseholds] = useState(INITIAL_HOUSEHOLDS);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [newHousehold, setNewHousehold] = useState({
    name: '',
    address: '',
    status: 'Active'
  });

  const filteredHouseholds = households.filter(item => {
    const matchesSearch = item.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          item.address.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'All' || item.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleAddHousehold = (e) => {
    e.preventDefault();
    if (!newHousehold.name || !newHousehold.address) return;

    const newItem = {
      id: `HG-2026-00${households.length + 1}`,
      name: newHousehold.name,
      address: newHousehold.address,
      complianceRate: 100,
      lastCollection: 'Vừa thêm',
      totalWeightMonth: 0,
      status: newHousehold.status
    };

    setHouseholds([newItem, ...households]);
    setIsModalOpen(false);
    setNewHousehold({ name: '', address: '', status: 'Active' });
  };

  const renderComplianceBadge = (rate) => {
    if (rate >= 85) {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#d9f99d] text-slate-900 rounded-full text-xs font-black">
          <CheckCircle2 size={12} className="text-lime-700" /> {rate}%
        </span>
      );
    } else if (rate >= 60) {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-sky-100 text-sky-900 rounded-full text-xs font-black">
          <Info size={12} className="text-sky-600" /> {rate}%
        </span>
      );
    } else {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-rose-100 text-rose-900 rounded-full text-xs font-black">
          <AlertTriangle size={12} className="text-rose-600" /> {rate}%
        </span>
      );
    }
  };

  return (
    <div className="p-6 space-y-6 w-full font-sans">
      
      {/* 1. HEADER VỚI TIÊU ĐỀ LỚN VÀ CÁC THẺ LỌC CAPSULE CHUẨN HÌNH MẪU */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-3 py-1 bg-[#bef264] text-slate-900 rounded-full text-[11px] font-black tracking-tight">
              PRO MANAGEMENT
            </span>
            <span className="text-xs font-bold text-slate-400">Hệ thống phân loại rác AI</span>
          </div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">
            Quản lý Hộ gia đình
          </h1>
          <p className="text-xs font-bold text-slate-400 mt-1">
            Theo dõi chỉ số tuân thủ và lượng rác thu gom theo khu vực
          </p>
        </div>

        {/* NÚT TẠO MỚI MÀU ĐEN + CAPSULE LIME GREEN */}
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-2 bg-slate-900 hover:bg-black text-white font-black px-6 py-3.5 rounded-full shadow-lg transition hover:scale-105 active:scale-95"
          >
            <Plus size={18} className="text-[#bef264]" />
            <span>Thêm Hộ Mới</span>
          </button>
        </div>
      </div>

      {/* 2. TOP CARDS BENTO GRID PHONG CÁCH NEUMORPHIC TRONG ẢNH */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 w-full">
        
        {/* THẺ 1: TỔNG SỐ HỘ (MÀU TRẮNG KEM SOFT) */}
        <div className="bg-white p-6 rounded-[32px] border border-slate-200/70 shadow-sm flex flex-col justify-between h-44">
          <div className="flex justify-between items-center">
            <span className="text-xs font-black text-slate-400 uppercase tracking-wider">Tổng số hộ</span>
            <span className="p-2 bg-slate-100 rounded-full text-slate-700">
              <Users size={16} />
            </span>
          </div>
          <div>
            <div className="text-4xl font-black text-slate-900 tracking-tight">{households.length} <span className="text-sm text-slate-400 font-bold">hộ</span></div>
            <p className="text-[11px] font-bold text-emerald-600 mt-1 flex items-center gap-1">
              <TrendingUp size={12} /> +12% so với tháng trước
            </p>
          </div>
        </div>

        {/* THẺ 2: TUÂN THỦ TRUNG BÌNH */}
        <div className="bg-white p-6 rounded-[32px] border border-slate-200/70 shadow-sm flex flex-col justify-between h-44">
          <div className="flex justify-between items-center">
            <span className="text-xs font-black text-slate-400 uppercase tracking-wider">Tuân thủ TB</span>
            <span className="p-2 bg-[#d9f99d] text-slate-900 rounded-full font-bold">
              <ShieldCheck size={16} />
            </span>
          </div>
          <div>
            <div className="text-4xl font-black text-slate-900 tracking-tight">82.8<span className="text-2xl font-bold">%</span></div>
            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden mt-2 p-0.5">
              <div className="bg-[#a3e635] h-full rounded-full w-[82.8%]" />
            </div>
          </div>
        </div>

        {/* THẺ 3: TỔNG THU GOM */}
        <div className="bg-white p-6 rounded-[32px] border border-slate-200/70 shadow-sm flex flex-col justify-between h-44">
          <div className="flex justify-between items-center">
            <span className="text-xs font-black text-slate-400 uppercase tracking-wider">Tổng lượng rác</span>
            <span className="p-2 bg-sky-100 text-sky-800 rounded-full font-bold">
              <Trash2 size={16} />
            </span>
          </div>
          <div>
            <div className="text-4xl font-black text-slate-900 tracking-tight">236 <span className="text-sm text-slate-400 font-bold">kg</span></div>
            <p className="text-[11px] font-bold text-slate-400 mt-1">Cập nhật lúc 08:30 hôm nay</p>
          </div>
        </div>

        {/* THẺ 4: WIDGET NỔI BẬT LIME GREEN (GIỐNG CARD DƯỚI GÓC TRÁI HÌNH MẪU) */}
        <div className="bg-[#bef264] p-6 rounded-[32px] text-slate-900 shadow-md shadow-lime-300/30 flex flex-col justify-between h-44 relative overflow-hidden">
          <div className="flex justify-between items-center">
            <span className="px-2.5 py-1 bg-slate-900 text-white rounded-full text-[10px] font-black uppercase">
              AI MONITORING
            </span>
            <Zap size={18} className="text-slate-900" />
          </div>
          <div>
            <div className="text-xs font-bold text-slate-800 opacity-80">Mức thưởng tích điểm</div>
            <div className="text-3xl font-black tracking-tight mt-0.5">1,240 pts</div>
            <p className="text-[10px] font-extrabold text-slate-800 mt-1">Dành cho top 5 hộ tuân thủ cao nhất</p>
          </div>
        </div>

      </div>

      {/* 3. BẢNG DỮ LIỆU & THANH BỘ LỌC CAPSULES */}
      <div className="bg-white p-6 rounded-[36px] border border-slate-200/70 shadow-sm space-y-5 w-full">
        
        {/* THANH TÌM KIẾM & BỘ LỌC CHUẨN NEUMORPHIC */}
        <div className="flex flex-col md:flex-row gap-3 justify-between items-center">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-4 top-3.5 text-slate-400" size={16} />
            <input 
              type="text" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Tìm theo ID, Tên, Địa chỉ..." 
              className="w-full bg-slate-100/90 pl-11 pr-4 py-3 rounded-full text-xs font-bold text-slate-800 placeholder-slate-400 outline-none border border-slate-200/50 focus:border-slate-900 transition"
            />
          </div>

          {/* CAPSULE TOGGLES */}
          <div className="flex flex-wrap gap-2 w-full md:w-auto">
            <button 
              onClick={() => setStatusFilter('All')}
              className={`px-5 py-2.5 rounded-full text-xs font-black transition ${
                statusFilter === 'All' 
                  ? 'bg-slate-900 text-white' 
                  : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
              }`}
            >
              Tất cả
            </button>
            <button 
              onClick={() => setStatusFilter('Active')}
              className={`px-5 py-2.5 rounded-full text-xs font-black transition ${
                statusFilter === 'Active' 
                  ? 'bg-[#bef264] text-slate-900' 
                  : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
              }`}
            >
              Đang hoạt động (Active)
            </button>
            <button 
              onClick={() => setStatusFilter('Inactive')}
              className={`px-5 py-2.5 rounded-full text-xs font-black transition ${
                statusFilter === 'Inactive' 
                  ? 'bg-slate-900 text-white' 
                  : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
              }`}
            >
              Ngưng (Inactive)
            </button>
          </div>
        </div>

        {/* BẢNG DỮ LIỆU SÀNH ĐIỆU */}
        <div className="overflow-x-auto w-full">
          <table className="w-full text-left border-collapse table-fixed">
            <thead>
              <tr className="text-[11px] font-black text-slate-400 uppercase tracking-wider border-b border-slate-100">
                <th className="pb-4 pl-2 w-[12%]">ID HỘ</th>
                <th className="pb-4 w-[16%]">CHỦ HỘ</th>
                <th className="pb-4 w-[24%]">ĐỊA CHỈ</th>
                <th className="pb-4 w-[16%]">TỶ LỆ TUÂN THỦ</th>
                <th className="pb-4 w-[15%]">THU GOM GẦN NHẤT</th>
                <th className="pb-4 w-[9%]">KHỐI LƯỢNG</th>
                <th className="pb-4 text-right pr-2 w-[8%]">THAO TÁC</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100/80 text-xs font-bold text-slate-700">
              {filteredHouseholds.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/80 transition duration-150 group">
                  <td className="py-4 pl-2 font-mono font-black text-slate-900">{item.id}</td>
                  <td className="py-4 font-black text-slate-900">{item.name}</td>
                  <td className="py-4 text-slate-500 pr-2 truncate font-medium">{item.address}</td>
                  <td className="py-4">{renderComplianceBadge(item.complianceRate)}</td>
                  <td className="py-4 font-mono text-slate-500 text-[11px]">{item.lastCollection}</td>
                  <td className="py-4 font-black text-slate-900 font-mono text-sm">{item.totalWeightMonth} kg</td>
                  <td className="py-4 text-right pr-2">
                    <button className="p-2 hover:bg-slate-100 text-slate-400 hover:text-slate-900 rounded-full transition">
                      <MoreVertical size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* PHÂN TRANG NEUMORPHIC */}
        <div className="flex flex-col md:flex-row justify-between items-center pt-4 border-t border-slate-100 text-xs font-bold text-slate-400 gap-3">
          <span>Hiển thị 1 - {filteredHouseholds.length} trong số 120 hộ gia đình</span>
          
          <div className="flex items-center gap-2">
            <button className="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-full transition">
              <ChevronLeft size={14} />
            </button>
            <button className="w-9 h-9 bg-slate-900 text-[#bef264] rounded-full font-black shadow-sm">1</button>
            <button className="w-9 h-9 hover:bg-slate-100 text-slate-600 rounded-full font-bold">2</button>
            <button className="w-9 h-9 hover:bg-slate-100 text-slate-600 rounded-full font-bold">3</button>
            <button className="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-full transition">
              <ChevronRight size={14} />
            </button>
          </div>
        </div>

      </div>

      {/* MODAL THÊM HỘ MỚI PURE NEUMORPHIC */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white w-full max-w-md p-6 rounded-[36px] shadow-2xl border border-slate-100 space-y-5">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <div className="p-2.5 bg-[#d9f99d] text-slate-900 rounded-2xl">
                  <UserPlus size={18} />
                </div>
                <h3 className="font-black text-slate-900 text-lg">Thêm Hộ Gia Đình Mới</h3>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="p-2 text-slate-400 hover:text-slate-600">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAddHousehold} className="space-y-4">
              <div>
                <label className="block text-xs font-black text-slate-700 mb-1">Tên Chủ Hộ</label>
                <input 
                  type="text" 
                  required
                  value={newHousehold.name}
                  onChange={(e) => setNewHousehold({...newHousehold, name: e.target.value})}
                  placeholder="Ví dụ: Nguyễn Văn A"
                  className="w-full bg-slate-100/90 px-4 py-3 rounded-2xl text-xs font-bold text-slate-800 outline-none border border-slate-200/50 focus:border-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-black text-slate-700 mb-1">Địa Chỉ</label>
                <input 
                  type="text" 
                  required
                  value={newHousehold.address}
                  onChange={(e) => setNewHousehold({...newHousehold, address: e.target.value})}
                  placeholder="Ví dụ: 123 Đường Nguyễn Trãi, Q1"
                  className="w-full bg-slate-100/90 px-4 py-3 rounded-2xl text-xs font-bold text-slate-800 outline-none border border-slate-200/50 focus:border-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-black text-slate-700 mb-1">Trạng Thái Vận Hành</label>
                <select
                  value={newHousehold.status}
                  onChange={(e) => setNewHousehold({...newHousehold, status: e.target.value})}
                  className="w-full bg-slate-100/90 px-4 py-3 rounded-2xl text-xs font-bold text-slate-800 outline-none border border-slate-200/50 focus:border-slate-900"
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>

              <div className="flex gap-2 pt-2">
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-3.5 bg-slate-100 text-slate-600 rounded-2xl text-xs font-bold hover:bg-slate-200 transition"
                >
                  Hủy bỏ
                </button>
                <button 
                  type="submit"
                  className="flex-1 py-3.5 bg-slate-900 text-[#bef264] rounded-2xl text-xs font-black hover:bg-black transition shadow-lg"
                >
                  Lưu thông tin
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}