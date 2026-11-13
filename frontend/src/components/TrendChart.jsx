import React, { useState } from 'react';
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

export default function TrendChart({ data }) {
  // State quản lý chế độ xem: 'week' (1 tuần) hoặc 'month' (1 tháng)
  const [timeFrame, setTimeFrame] = useState('week');

  // Dữ liệu theo tuần (7 ngày)
  const weekData = data || [
    { day: "T2", kg: 1800 },
    { day: "T3", kg: 2200 },
    { day: "T4", kg: 1900 },
    { day: "T5", kg: 2400 },
    { day: "T6", kg: 2100 },
    { day: "T7", kg: 2800 },
    { day: "CN", kg: 2513 }
  ];

  // Dữ liệu mô phỏng theo tháng (4 tuần)
  const monthData = [
    { day: "Tuần 1", kg: 12400 },
    { day: "Tuần 2", kg: 14800 },
    { day: "Tuần 3", kg: 13500 },
    { day: "Tuần 4", kg: 16200 }
  ];

  // Chọn bộ dữ liệu tương ứng
  const currentData = timeFrame === 'week' ? weekData : monthData;

  return (
    <div className="bg-white p-6 rounded-[32px] border border-slate-200/60 shadow-sm flex flex-col justify-between h-full">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h3 className="font-extrabold text-slate-900 text-base">
            {timeFrame === 'week' ? 'Lưu lượng rác thải (7 ngày)' : 'Lưu lượng rác thải (4 tuần)'}
          </h3>
          <p className="text-xs text-slate-400 font-medium">
            Xu hướng khối lượng rác thu gom {timeFrame === 'week' ? 'theo ngày' : 'theo tuần'}
          </p>
        </div>

        {/* Nút lọc thời gian dạng Capsule có thể click chuyển đổi */}
        <div className="flex bg-slate-100 p-1 rounded-full text-xs font-bold text-slate-500 border border-slate-200/50">
          <button 
            onClick={() => setTimeFrame('week')}
            className={`px-3 py-1 rounded-full transition-all duration-200 ${
              timeFrame === 'week' 
                ? 'bg-white text-slate-900 shadow-sm font-black' 
                : 'hover:text-slate-900 text-slate-500'
            }`}
          >
            1 tuần
          </button>
          
          <button 
            onClick={() => setTimeFrame('month')}
            className={`px-3 py-1 rounded-full transition-all duration-200 ${
              timeFrame === 'month' 
                ? 'bg-white text-slate-900 shadow-sm font-black' 
                : 'hover:text-slate-900 text-slate-500'
            }`}
          >
            1 tháng
          </button>
        </div>
      </div>

      <div className="h-48">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={currentData} barCategoryGap={timeFrame === 'week' ? "25%" : "35%"}>
            <XAxis 
              dataKey="day" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fontSize: 12, fontWeight: 700, fill: '#64748b' }} 
            />
            <Tooltip 
              contentStyle={{ backgroundColor: '#0f172a', borderRadius: '16px', color: '#fff', border: 'none' }}
              itemStyle={{ color: '#fbbf24' }}
            />
            <Bar dataKey="kg" radius={[20, 20, 20, 20]}>
              {currentData.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={
                    index === currentData.length - 2 
                      ? '#f97316' 
                      : index % 2 === 0 
                      ? '#0f172a' 
                      : '#94a3b8'
                  } 
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}