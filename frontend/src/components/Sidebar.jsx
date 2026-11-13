import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  TrendingUp, 
  Database, 
  Radio, 
  Settings, 
  ChevronLeft, 
  ChevronRight,
  Leaf,
  LogOut,
  Sparkles
} from 'lucide-react';

export default function Sidebar({ activeTab, setActiveTab }) {
  const [isExpanded, setIsExpanded] = useState(true);

  const menuItems = [
    { name: 'Dashboard', icon: LayoutDashboard },
    { name: 'Hộ gia đình', icon: TrendingUp },
    { name: 'Logs', icon: Database },
    { name: 'Devices', icon: Radio },
    { name: 'Settings', icon: Settings },
  ];

  return (
    <aside 
      className={`relative bg-[#f8fafc] border-r border-slate-200/60 min-h-screen transition-all duration-300 ease-in-out flex flex-col justify-between p-4 z-20 ${
        isExpanded ? 'w-64' : 'w-20'
      }`}
    >
      {/* Nút Toggle Sidebar */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="absolute -right-3 top-8 w-7 h-7 bg-white border border-slate-200 rounded-full flex items-center justify-center text-slate-600 shadow-md transition-all z-30 hover:scale-110"
      >
        {isExpanded ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
      </button>

      <div>
        {/* LOGO BRAND */}
        <div className="flex items-center gap-3 px-2 py-3 mb-6">
          <div className="w-10 h-10 bg-slate-900 rounded-2xl flex items-center justify-center text-white shrink-0 shadow-sm">
            <Leaf size={20} className="text-emerald-400" />
          </div>
          
          {isExpanded && (
            <div className="flex flex-col">
              <span className="font-extrabold text-slate-900 text-base leading-tight">
                EcoSmart AI
              </span>
              <span className="text-[10px] font-bold text-slate-400 tracking-wider">
                V2.4 PRO
              </span>
            </div>
          )}
        </div>

        {/* SEARCH BAR MINI */}
        {isExpanded && (
          <div className="mb-6 px-1">
            <div className="w-full bg-slate-100/80 px-3 py-2 rounded-2xl text-xs text-slate-400 flex items-center justify-between border border-slate-200/50">
              <span>Tìm kiếm...</span>
              <span className="text-[10px] bg-white px-1.5 py-0.5 rounded-lg border border-slate-200">⌘K</span>
            </div>
          </div>
        )}

        {/* MENU ITEMS */}
        <nav className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.name;

            return (
              <button
                key={item.name}
                onClick={() => setActiveTab(item.name)}
                className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-2xl text-xs font-bold transition-all relative ${
                  isActive
                    ? 'bg-slate-900 text-white shadow-lg shadow-slate-900/10'
                    : 'text-slate-500 hover:bg-slate-100/80 hover:text-slate-800'
                }`}
              >
                <Icon size={18} className={isActive ? 'text-white' : 'text-slate-400'} />
                {isExpanded && <span>{item.name}</span>}
              </button>
            );
          })}
        </nav>
      </div>

      {/* WIDGET CARD DƯỚI CÙNG */}
      <div className="space-y-3">
        {isExpanded && (
          <div className="bg-gradient-to-br from-amber-500 to-orange-500 p-4 rounded-3xl text-white shadow-lg shadow-orange-500/20 relative overflow-hidden">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold opacity-90">Hiệu suất trạm</span>
              <Sparkles size={16} />
            </div>
            <div className="text-xl font-extrabold my-1">98.5%</div>
            <p className="text-[10px] opacity-80">Trạm đang vận hành tối ưu nhất</p>
            
            <div className="w-full bg-black/10 h-2 rounded-full mt-3 overflow-hidden p-0.5">
              <div className="bg-white h-full rounded-full w-[85%]" />
            </div>
          </div>
        )}

        <button className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-xs font-bold text-slate-400 hover:bg-slate-100/80 hover:text-slate-600 transition">
          <LogOut size={18} />
          {isExpanded && <span>Đăng xuất</span>}
        </button>
      </div>
    </aside>
  );
}