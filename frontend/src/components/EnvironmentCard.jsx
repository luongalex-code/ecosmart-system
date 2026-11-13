import React from 'react';
import { Thermometer, Droplets, Wind, Activity, AlertTriangle, CheckCircle2, RefreshCw } from 'lucide-react';

export default function EnvironmentCard({ data }) {
  const temp = data?.temperature || 0;
  const humidity = data?.humidity || 0;
  const isTempWarning = temp > 35;
  const tempPercentage = Math.min(Math.max(((temp - 20) / (50 - 20)) * 100, 0), 100);

  // Giả lập chỉ số AQI và Fan dựa theo nhiệt độ
  const aqiValue = isTempWarning ? 78 : 42; 
  const fanStatus = isTempWarning ? 'Đang bật 100%' : 'Tự động (30%)';

  return (
    <div className="bg-white p-6 rounded-[32px] border border-slate-200/60 shadow-sm flex flex-col justify-between h-full">
      
      {/* HEADER CARD */}
      <div className="flex justify-between items-center mb-2">
        <div>
          <h3 className="font-extrabold text-slate-900 text-base">Môi trường Trạm</h3>
          <p className="text-[11px] font-semibold text-slate-400">Cảm biến IoT cập nhật thời gian thực</p>
        </div>
        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
      </div>

      <div className="space-y-3 my-auto">
        
        {/* 1. NHIỆT ĐỘ */}
        <div className="bg-slate-50/80 p-3.5 rounded-2xl border border-slate-200/50">
          <div className="flex justify-between items-center mb-1.5">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-rose-100 text-rose-500 rounded-xl">
                <Thermometer size={16} />
              </div>
              <span className="text-xs font-extrabold text-slate-700">Nhiệt độ</span>
            </div>
            {isTempWarning ? (
              <span className="px-2.5 py-0.5 bg-rose-100 text-rose-600 rounded-full text-[10px] font-black flex items-center gap-1">
                <AlertTriangle size={10} /> Cảnh báo
              </span>
            ) : (
              <span className="px-2.5 py-0.5 bg-emerald-100 text-emerald-700 rounded-full text-[10px] font-black">
                Bình thường
              </span>
            )}
          </div>
          
          <div className="text-2xl font-black text-slate-900">{temp}°C</div>
          
          <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden p-0.5 mt-2">
            <div 
              className="h-full bg-gradient-to-r from-emerald-400 via-amber-400 to-rose-500 rounded-full transition-all duration-500" 
              style={{ width: `${tempPercentage}%` }} 
            />
          </div>
        </div>

        {/* 2. ĐỘ ẨM */}
        <div className="bg-slate-50/80 p-3.5 rounded-2xl border border-slate-200/50">
          <div className="flex justify-between items-center mb-1.5">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-blue-100 text-blue-500 rounded-xl">
                <Droplets size={16} />
              </div>
              <span className="text-xs font-extrabold text-slate-700">Độ ẩm</span>
            </div>
            <span className="px-2.5 py-0.5 bg-emerald-100 text-emerald-700 rounded-full text-[10px] font-black">
              Bình thường
            </span>
          </div>
          
          <div className="text-2xl font-black text-slate-900">{humidity}%</div>
          
          <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden p-0.5 mt-2">
            <div 
              className="h-full bg-slate-900 rounded-full transition-all duration-500" 
              style={{ width: `${humidity}%` }} 
            />
          </div>
        </div>

        {/* 3. CHẤT LƯỢNG KHÔNG KHÍ (AQI) & THÔNG GIÓ (MỚI BỔ SUNG ĐỂ LẤP KHOẢNG TRỐNG) */}
        <div className="grid grid-cols-2 gap-2.5 pt-1">
          <div className="bg-slate-50/80 p-3 rounded-2xl border border-slate-200/50">
            <div className="flex items-center gap-1.5 text-[11px] font-extrabold text-slate-500 mb-1">
              <Activity size={14} className="text-amber-500" />
              <span>Khí thải AQI</span>
            </div>
            <div className="text-lg font-black text-slate-800">{aqiValue} <span className="text-[10px] text-slate-400 font-bold">Good</span></div>
          </div>

          <div className="bg-slate-50/80 p-3 rounded-2xl border border-slate-200/50">
            <div className="flex items-center gap-1.5 text-[11px] font-extrabold text-slate-500 mb-1">
              <Wind size={14} className="text-emerald-500" />
              <span>Quạt tản nhiệt</span>
            </div>
            <div className="text-xs font-extrabold text-slate-800 truncate">{fanStatus}</div>
          </div>
        </div>

      </div>

      {/* FOOTER MINI SUMMARY */}
      <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] font-bold text-slate-400">
        <span>Hệ thống thông gió: Tự động</span>
        <div className="flex items-center gap-1 text-emerald-600">
          <RefreshCw size={10} className="animate-spin" />
          <span>Realtime</span>
        </div>
      </div>

    </div>
  );
}