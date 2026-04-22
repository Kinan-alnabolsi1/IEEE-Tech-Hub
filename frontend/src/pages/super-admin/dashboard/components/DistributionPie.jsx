import React from 'react';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip as ChartTooltip,
} from 'chart.js';
import { Doughnut } from 'react-chartjs-2';

// تسجيل الإضافات الخاصة بالشارت الدائري
ChartJS.register(ArcElement, ChartTooltip);

const COLORS = ['#00629B', '#00B5E2', '#00456E', '#80C342', '#FFB81C'];

const DistributionPie = ({ pieData }) => {
  
  // 🌟 مسحنا الداتا الوهمية.. هون بنأخذ الداتا الحقيقية فقط وإذا مافي بنعتبرها مصفوفة فاضية
  const safeData = Array.isArray(pieData) ? pieData : [];

  // تجهيز البيانات بصيغة Chart.js
  const data = {
    labels: safeData.map(item => item.region),
    datasets: [
      {
        data: safeData.map(item => item.count || item.value || item.total || 0),
        backgroundColor: COLORS,
        borderWidth: 0, 
        hoverOffset: 6, 
        borderRadius: 6, 
        spacing: 4, 
      },
    ],
  };

  // إعدادات الشارت
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '72%', 
    animation: {
      animateScale: true, 
      animateRotate: true,
      duration: 1500,
      easing: 'easeOutQuart',
    },
    plugins: {
      legend: {
        display: false, 
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

      <div className="flex-1 w-full relative min-h-[220px] flex items-center justify-center">
        {/* 🌟 إذا مافي فروع أبداً، منعرض هي الرسالة الأنيقة بدال الداتا الوهمية */}
        {safeData.length === 0 ? (
           <div className="absolute inset-0 flex items-center justify-center z-10 bg-white/60 backdrop-blur-[1px]">
              <span className="text-slate-400 text-[10px] font-black uppercase tracking-widest italic bg-white px-3 py-1 rounded-full shadow-sm border border-slate-100">
                 No branches yet
              </span>
           </div>
        ) : (
           <Doughnut data={data} options={options} />
        )}
      </div>

      {/* الليجند الأنيق الخاص بكِ (لا يظهر إلا إذا كان هناك بيانات) */}
      {safeData.length > 0 && (
        <div className="space-y-3 mt-6 border-t border-slate-50 pt-6">
          {safeData.map((item, i) => (
            <div key={i} className="flex justify-between items-center text-[11px]">
              <div className="flex items-center">
                <div 
                  className="w-2.5 h-2.5 rounded-full mr-3 shadow-sm" 
                  style={{ backgroundColor: COLORS[i % COLORS.length] }}
                ></div>
                <span className="text-slate-500 font-bold uppercase tracking-tight">{item.region}</span>
              </div>
              <span className="font-black text-slate-800 bg-slate-50 px-2 py-0.5 rounded-md">{item.count || item.value || item.total || 0}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DistributionPie;