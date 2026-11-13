import React from 'react';
import StatCard from '../components/StatCard';
import TotalCard from '../components/TotalCard';
import EnvironmentCard from '../components/EnvironmentCard';
import WasteLogTable from '../components/WasteLogTable';
import AccuracyChart from '../components/AccuracyChart';
import TrendChart from '../components/TrendChart';

export default function Dashboard({ data }) {
  const stats = data?.waste_stats || {};

  return (
    <main className="p-6 space-y-6 max-w-7xl mx-auto w-full">
      {/* TIÊU ĐỀ BẢNG ĐIỀU KHIỂN */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">
            Tổng quan {data?.station_name || 'Trạm XL rác số 1'}
          </h1>
          <p className="text-xs font-semibold text-slate-400 mt-1">
            Dữ liệu thời gian thực được tối ưu hóa bởi AI.
          </p>
        </div>
      </div>

      {/* HÀNG 1: 4 THẺ CHỈ SỐ KHỐI LƯỢNG */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard 
          title="Rác Hữu Cơ" 
          value={stats.organic_kg || 0} 
          capacity={stats.organic_percent || 0} 
          color="emerald" 
        />
        <StatCard 
          title="Tái Chế" 
          value={stats.recycle_kg || 0} 
          capacity={stats.recycle_percent || 0} 
          color="blue" 
        />
        <StatCard 
          title="Rác Khác" 
          value={stats.other_kg || 0} 
          capacity={stats.other_percent || 0} 
          color="slate" 
        />
        <TotalCard 
          totalKg={stats.total_kg || 0} 
          growthPercent={stats.growth_percent || 0} 
        />
      </div>

      {/* HÀNG 2: MÔI TRƯỜNG & NHẬT KÝ PHÂN LOẠI */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-stretch">
        <div className="md:col-span-1 h-full">
          <EnvironmentCard data={data?.environment} />
        </div>
        <div className="md:col-span-2 h-full">
          <WasteLogTable logs={data?.waste_logs} />
        </div>
      </div>

      {/* HÀNG 3: ĐỘ CHÍNH XÁC AI & BIỂU ĐỒ 7 NGÀY */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-stretch">
        <div className="md:col-span-1 h-full">
          <AccuracyChart data={data?.ai_accuracy} />
        </div>
        <div className="md:col-span-2 h-full">
          <TrendChart data={data?.waste_trend_7days} />
        </div>
      </div>
    </main>
  );
}