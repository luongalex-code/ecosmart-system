import React from 'react';
import { 
  Leaf, 
  Recycle, 
  Trash2, 
  HelpCircle, 
  ArrowRight, 
  Clock, 
  Sparkles,
  ChevronRight
} from 'lucide-react';

export default function WasteLogTable({ logs }) {
  const getBadgeConfig = (type) => {
    switch (type) {
      case 'Hữu Cơ':
        return {
          label: 'Hữu Cơ',
          icon: Leaf,
          style: 'bg-emerald-500/10 text-emerald-700 border-emerald-500/20',
          barColor: 'bg-emerald-500'
        };
      case 'Tái Chế':
      case 'Nhựa / Tái chế':
        return {
          label: 'Nhựa / Tái chế',
          icon: Recycle,
          style: 'bg-blue-500/10 text-blue-700 border-blue-500/20',
          barColor: 'bg-blue-500'
        };
      case 'Rác Khác':
        return {
          label: 'Rác Khác',
          icon: Trash2,
          style: 'bg-slate-500/10 text-slate-700 border-slate-500/20',
          barColor: 'bg-slate-500'
        };
      default:
        return {
          label: 'Không xác định',
          icon: HelpCircle,
          style: 'bg-amber-500/10 text-amber-700 border-amber-500/20',
          barColor: 'bg-amber-500'
        };
    }
  };

  return (
    <div className="bg-white p-6 rounded-[32px] border border-slate-200/60 shadow-sm flex flex-col justify-between h-full w-full">
      
      {/* HEADER TABLE */}
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-emerald-50 text-emerald-600 rounded-2xl border border-emerald-100">
            <Sparkles size={18} />
          </div>
          <div>
            <h3 className="font-extrabold text-slate-900 text-base">
              Nhật ký Phân loại AI
            </h3>
            <p className="text-[11px] font-semibold text-slate-400">Tự động nhận diện thời gian thực</p>
          </div>
        </div>

        <button className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-600 hover:text-emerald-700 bg-emerald-50 hover:bg-emerald-100/80 px-3.5 py-1.5 rounded-full transition-all">
          <span>Xem tất cả</span>
          <ArrowRight size={13} />
        </button>
      </div>

      {/* TABLE DATA - CẤU TRÚC PHÂN BỔ 100% ĐỘ RỘNG */}
      <div className="overflow-x-auto w-full">
        <table className="w-full text-left border-collapse table-fixed">
          <thead>
            <tr className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider border-b border-slate-100">
              <th className="pb-3 pl-2 w-[12%]">Ảnh</th>
              <th className="pb-3 w-[20%]">Thời gian</th>
              <th className="pb-3 w-[28%]">Phân loại AI</th>
              <th className="pb-3 w-[22%]">Độ tin cậy</th>
              <th className="pb-3 pr-2 text-right w-[18%]">Khối lượng</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100/80 text-xs font-semibold text-slate-700">
            {!logs || logs.length === 0 ? (
              <tr>
                <td colSpan="5" className="text-center py-10 text-slate-400">
                  <div className="flex flex-col items-center gap-2">
                    <Sparkles size={24} className="text-slate-300 animate-pulse" />
                    <span>Đang chờ dữ liệu AI quét rác thời gian thực...</span>
                  </div>
                </td>
              </tr>
            ) : (
              logs.map((item, index) => {
                const config = getBadgeConfig(item.ai_type);
                const IconComponent = config.icon;
                const confidence = item.confidence || 0;

                return (
                  <tr 
                    key={item.id || index} 
                    className="hover:bg-slate-50/80 transition-colors duration-200 group"
                  >
                    {/* 1. Ảnh Xem Trước */}
                    <td className="py-3 pl-2">
                      <div className="relative w-9 h-9 rounded-2xl overflow-hidden ring-1 ring-slate-900/5 shadow-2xs group-hover:scale-105 transition-transform duration-200">
                        <img 
                          src={item.image_url || "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=100&auto=format&fit=crop&q=60"} 
                          alt="AI Scan" 
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </td>

                    {/* 2. Thời gian */}
                    <td className="py-3 font-mono text-slate-500 text-[11px]">
                      <div className="flex items-center gap-1.5">
                        <Clock size={12} className="text-slate-400 shrink-0" />
                        <span>{item.time || 'N/A'}</span>
                      </div>
                    </td>

                    {/* 3. Badge Phân Loại AI */}
                    <td className="py-3">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 border rounded-full text-[11px] font-bold tracking-tight ${config.style}`}>
                        <IconComponent size={12} className="shrink-0" />
                        <span className="truncate">{config.label}</span>
                      </span>
                    </td>

                    {/* 4. Độ Tin Cậy (Progress Bar) */}
                    <td className="py-3 pr-2">
                      <div className="flex flex-col gap-1 w-full max-w-[120px]">
                        <span className="font-extrabold text-slate-800 text-[11px]">{confidence}%</span>
                        <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                          <div 
                            className={`h-full ${config.barColor} rounded-full transition-all duration-500`}
                            style={{ width: `${Math.min(confidence, 100)}%` }}
                          />
                        </div>
                      </div>
                    </td>

                    {/* 5. Khối Lượng (CĂN SÁT LỀ PHẢI - KHÔNG BỊ TRỐNG GÓC PHẢI) */}
                    <td className="py-3 pr-2 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <span className="font-black text-slate-900 text-sm font-mono">
                          {item.weight ? `${item.weight} kg` : '0 kg'}
                        </span>
                        <ChevronRight size={14} className="text-slate-300 group-hover:text-slate-600 transition-colors" />
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}