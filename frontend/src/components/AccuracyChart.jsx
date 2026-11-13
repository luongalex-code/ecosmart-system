import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

export default function AccuracyChart({ data }) {
  const chartData = [
    { name: 'Chính xác', value: data?.correct_percent || 94.2 },
    { name: 'Lỗi', value: data?.error_percent || 5.8 },
  ];

  // Màu Đen & Cam chuẩn hình mẫu
  const COLORS = ['#0f172a', '#f97316'];

  return (
    <div className="bg-white p-6 rounded-[32px] border border-slate-200/60 shadow-sm flex flex-col justify-between h-full">
      <div className="flex justify-between items-center mb-2">
        <h3 className="font-extrabold text-slate-900 text-base">Độ chính xác AI</h3>
        <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-1 rounded-lg">24h qua</span>
      </div>

      <div className="h-44 relative flex items-center justify-center my-2">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={chartData} innerRadius={50} outerRadius={68} startAngle={90} endAngle={-270} dataKey="value" stroke="none">
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        <div className="absolute text-center">
          <span className="text-2xl font-black text-slate-900">{data?.success_rate || 94}%</span>
          <p className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider">Thành công</p>
        </div>
      </div>

      <div className="flex justify-center gap-4 text-xs font-bold text-slate-600">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-slate-900" />
          <span>Chính xác ({data?.correct_percent || 94.2}%)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-orange-500" />
          <span>Lỗi ({data?.error_percent || 5.8}%)</span>
        </div>
      </div>
    </div>
  );
}