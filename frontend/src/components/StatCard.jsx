import React from 'react';
import { Leaf, Recycle, Trash2 } from 'lucide-react';

export default function StatCard({ title, value, capacity, color }) {
  const configMap = {
    emerald: { bg: 'bg-emerald-500', text: 'text-emerald-600', Icon: Leaf },
    blue: { bg: 'bg-blue-500', text: 'text-blue-600', Icon: Recycle },
    slate: { bg: 'bg-slate-800', text: 'text-slate-700', Icon: Trash2 }
  };

  const config = configMap[color] || configMap.slate;

  return (
    <div className="bg-white p-6 rounded-[28px] border border-slate-200/60 shadow-sm flex flex-col justify-between h-full">
      <div className="flex justify-between items-center mb-3">
        <span className="text-sm font-extrabold text-slate-900">{title}</span>
        <span className="text-xs font-semibold text-slate-400">Sức chứa</span>
      </div>

      <div className="flex items-center justify-between gap-4 my-2">
        <div className="flex items-baseline gap-1">
          <span className="text-3xl font-black text-slate-900 tracking-tight">{value.toLocaleString()}</span>
          <span className="text-xs font-extrabold text-slate-400">kg</span>
        </div>

        {/* Cụm Capsule Pill kép giống hình mẫu */}
        <div className="flex items-center bg-slate-100 p-1 rounded-full gap-2 border border-slate-200/50">
          <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center text-slate-600 shadow-sm">
            <span className="text-xs font-bold">{capacity}%</span>
          </div>
          <div className={`w-12 h-8 rounded-full ${config.bg} flex items-center justify-center text-white shadow-sm`}>
            <config.Icon size={16} />
          </div>
        </div>
      </div>

      {/* Progress Bar Capsule */}
      <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden p-0.5 mt-2 border border-slate-200/40">
        <div className={`h-full ${config.bg} rounded-full transition-all duration-500`} style={{ width: `${capacity}%` }} />
      </div>
    </div>
  );
}