const fs = require('fs');
const path = require('path');

const DB_PATH = path.join(__dirname, 'data', 'database.json');

// Danh sách loại rác và ảnh mẫu mô phỏng
const WASTE_TYPES = ['Hữu Cơ', 'Nhựa / Tái chế', 'Rác Khác', 'Không xác định'];
const SAMPLE_IMAGES = [
  'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=100&auto=format&fit=crop&q=60',
  'https://images.unsplash.com/photo-1611284446314-60a58ac0deb9?w=100&auto=format&fit=crop&q=60',
  'https://images.unsplash.com/photo-1530587191325-3db32d826c18?w=100&auto=format&fit=crop&q=60'
];

// Hàm sinh số ngẫu nhiên trong khoảng [min, max]
const getRandomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const getRandomFloat = (min, max) => parseFloat((Math.random() * (max - min) + min).toFixed(1));

function generateSimulatedData() {
  const organicKg = getRandomInt(1000, 1500);
  const recycleKg = getRandomInt(700, 1100);
  const otherKg = getRandomInt(300, 600);
  const totalKg = organicKg + recycleKg + otherKg;

  // Tạo danh sách 5 nhật ký gần nhất
  const wasteLogs = Array.from({ length: 5 }).map((_, index) => {
    const aiType = WASTE_TYPES[getRandomInt(0, WASTE_TYPES.length - 1)];
    const now = new Date();
    now.setSeconds(now.getSeconds() - index * 15);
    
    return {
      id: `LOG-${Date.now()}-${index}`,
      time: now.toLocaleTimeString('vi-VN'),
      ai_type: aiType,
      confidence: getRandomFloat(85.0, 99.5),
      weight: getRandomFloat(0.5, 4.5),
      image_url: SAMPLE_IMAGES[getRandomInt(0, SAMPLE_IMAGES.length - 1)]
    };
  });

  return {
    station_name: "Trạm XL rác số 1",
    waste_stats: {
      organic_kg: organicKg,
      organic_percent: getRandomInt(50, 70),
      recycle_kg: recycleKg,
      recycle_percent: getRandomInt(30, 50),
      other_kg: otherKg,
      other_percent: getRandomInt(10, 30),
      total_kg: totalKg,
      growth_percent: getRandomInt(5, 18)
    },
    environment: {
      temperature: getRandomFloat(28.0, 39.5),
      humidity: getRandomInt(55, 80),
      temp_status: "Bình thường",
      humidity_status: "Bình thường"
    },
    ai_accuracy: {
      success_rate: getRandomInt(92, 98),
      correct_percent: getRandomFloat(90.0, 96.0),
      error_percent: getRandomFloat(2.0, 8.0)
    },
    waste_trend_7days: [
      { day: "T2", kg: getRandomInt(1500, 2200) },
      { day: "T3", kg: getRandomInt(1800, 2400) },
      { day: "T4", kg: getRandomInt(1600, 2100) },
      { day: "T5", kg: getRandomInt(2000, 2600) },
      { day: "T6", kg: getRandomInt(1900, 2300) },
      { day: "T7", kg: getRandomInt(2400, 2900) },
      { day: "CN", kg: totalKg }
    ],
    waste_logs: wasteLogs
  };
}

console.log("🤖 Bắt đầu chạy mô phỏng dữ liệu EcoSmart AI (Mỗi 3 giây cập nhật 1 lần)...");

// Ghi dữ liệu giả lập vào database.json mỗi 3 giây
setInterval(() => {
  const simulatedData = generateSimulatedData();
  fs.writeFileSync(DB_PATH, JSON.stringify(simulatedData, null, 2), 'utf8');
  console.log(`[${new Date().toLocaleTimeString('vi-VN')}] 🔄 Đã cập nhật dữ liệu mô phỏng mới!`);
}, 3000);