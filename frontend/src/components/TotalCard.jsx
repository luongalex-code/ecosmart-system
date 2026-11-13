import React from 'react';
import { Package, TrendingUp, Share2 } from 'lucide-react';

export default function TotalCard({ totalKg, growthPercent }) {
  return (
    <div className="bg-gradient-to-br from-amber-500 via-orange-500 to-amber-600 text-white p-6 rounded-[28px] shadow-lg shadow-orange-500/20 flex flex-col justify-between relative overflow-hidden">
      
      {/* Nút share nhỏ ở góc */}
      <div className="flex justify-between items-center">
        <div className="w-9 h-9 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white border border-white/20">
          <Package size={18} />
        </div>
        <button className="p-2 bg-white/20 hover:bg-white/30 rounded-full text-white backdrop-blur-md transition">
          <Share2 size={14} />
        </button>
      </div>

      <div className="my-3">
        <span className="text-xs font-bold text-white/80 uppercase tracking-wider">Tổng Khối Lượng</span>
        <div className="flex items-baseline gap-1 mt-1">
          <span className="text-4xl font-black text-white tracking-tight">{totalKg.toLocaleString()}</span>
          <span className="text-sm font-bold text-white/90">kg</span>
        </div>
      </div>

      {/* Capsule Báo Tăng Trưởng */}
      <div className="flex items-center gap-2 bg-white/20 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-white/30 w-fit">
        <TrendingUp size={14} className="text-white" />
        <span className="text-xs font-extrabold text-white">+{growthPercent}%</span>
        <span className="text-[10px] font-semibold text-white/80">so với hôm qua</span>
      </div>
    </div>
  );
}