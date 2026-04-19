import React from 'react';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip as ChartTooltip,
} from 'chart.js';
import { Doughnut } from 'react-chartjs-2';

// 1. تسجيل الإضافات الخاصة بالشارت الدائري
ChartJS.register(ArcElement, ChartTooltip);

const COLORS = ['#00629B', '#00B5E2', '#00456E', '#80C342', '#FFB81C'];

const DistributionPie = ({ pieData = [] }) => {
  
  // داتا وهمية في حال الباك إند لسا ما بعت داتا (عشان ما تضل الشاشة فاضية)
  const displayData = pieData.length > 0 ? pieData : [
    { region: 'Damascus', count: 120 },
    { region: 'Aleppo', count: 85 },
    { region: 'Homs', count: 40 },
    { region: 'Latakia', count: 65 },
  ];

  // 2. تجهيز البيانات بصيغة Chart.js
  const data = {
    labels: displayData.map(item => item.region),
    datasets: [
      {
        data: displayData.map(item => item.count),
        backgroundColor: COLORS,
        borderWidth: 0, // إخفاء الحدود العادية
        hoverOffset: 6, // تأثير بروز القطعة لما الماوس يمر فوقها
        borderRadius: 6, // تدوير زوايا القطع (Corner Radius)
        spacing: 4, // المسافة الفراغية بين القطع (Padding Angle)
      },
    ],
  };

  // 3. إعدادات الشارت
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '72%', // نسبة التجويف الداخلي (Inner Radius)
    animation: {
      animateScale: true, // حركة ظهور من المنتصف
      animateRotate: true,
      duration: 1500,
      easing: 'easeOutQuart',
    },
    plugins: {
      legend: {
        display: false, // إخفاء الليجند الافتراضي لأننا سنستخدم الليجند المخصص تبعك بالأسفل
      },
      tooltip: {
        backgroundColor: '#ffffff',
        titleColor: '#0f172a',
        bodyColor: '#64748b',
        borderColor: '#f1f5f9',
        borderWidth: 1,
        padding: 12,
        usePointStyle: true,
        bodyFont: { size: 13, weight: 'bold', family: 'sans-serif' },
        callbacks: {
          label: (context) => ` ${context.raw} Branches`
        }
      },
    },
  };

  return (
    <div className="bg-white p-8 rounded-[2.5rem] border border-slate-50 shadow-sm h-full flex flex-col min-h-[400px]">
      <div className="mb-6">
        <h3 className="text-slate-900 font-bold text-lg tracking-tight">Branch Distribution</h3>
        <p className="text-slate-400 text-xs font-medium">By Geographical Region</p>
      </div>

      {/* 🌟 السر هنا لعدم اختفاء الشارت: relative و height محدد */}
      <div className="flex-1 w-full relative min-h-[220px] flex items-center justify-center">
        {pieData.length === 0 && (
           <div className="absolute inset-0 flex items-center justify-center z-10 bg-white/60 backdrop-blur-[1px]">
              <span className="text-slate-400 text-[10px] font-black uppercase tracking-widest italic bg-white px-3 py-1 rounded-full shadow-sm">
                 Mock Data Preview
              </span>
           </div>
        )}
        <Doughnut data={data} options={options} />
      </div>

      {/* Custom Legend (الليجند الأنيق الخاص بكِ) */}
      <div className="space-y-3 mt-6 border-t border-slate-50 pt-6">
        {displayData.map((item, i) => (
          <div key={i} className="flex justify-between items-center text-[11px]">
            <div className="flex items-center">
              <div 
                className="w-2.5 h-2.5 rounded-full mr-3 shadow-sm" 
                style={{ backgroundColor: COLORS[i % COLORS.length] }}
              ></div>
              <span className="text-slate-500 font-bold uppercase tracking-tight">{item.region}</span>
            </div>
            <span className="font-black text-slate-800 bg-slate-50 px-2 py-0.5 rounded-md">{item.count}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DistributionPie;