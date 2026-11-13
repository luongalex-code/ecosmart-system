import React from 'react';
import { Search, Bell, Moon, SlidersHorizontal } from 'lucide-react';

export default function Header({ isConnected }) {
  return (
    <header className="flex justify-between items-center py-4 px-8 bg-transparent">
      {/* PROFILE USER CORNER (GIỐNG GÓC TRÁI HÌNH MẪU) */}
      <div className="flex items-center gap-3 bg-white/80 backdrop-blur-md px-3 py-1.5 rounded-full border border-slate-200/60 shadow-sm">
        <div className="w-8 h-8 rounded-full bg-slate-300 overflow-hidden ring-2 ring-white">
          <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80" alt="Avatar" className="w-full h-full object-cover" />
        </div>
        <span className="text-xs font-bold text-slate-800 pr-2">Admin Trạm 01</span>
      </div>

      {/* RIGHT CONTROLS */}
      <div className="flex items-center gap-3">
        {/* BADGE TRẠNG THÁI */}
        <div className="flex items-center gap-2 bg-white/80 px-4 py-2 rounded-full border border-slate-200/60 shadow-sm">
          <span className={`w-2.5 h-2.5 rounded-full ${isConnected ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`} />
          <span className="text-xs font-bold text-slate-700">
            {isConnected ? 'AI Active' : 'Disconnected'}
          </span>
        </div>

        <button className="p-2.5 bg-white/80 hover:bg-white rounded-full text-slate-600 border border-slate-200/60 shadow-sm transition">
          <Moon size={16} />
        </button>
        
        <button className="p-2.5 bg-white/80 hover:bg-white rounded-full text-slate-600 border border-slate-200/60 shadow-sm transition">
          <Bell size={16} />
        </button>
      </div>
    </header>
  );
}