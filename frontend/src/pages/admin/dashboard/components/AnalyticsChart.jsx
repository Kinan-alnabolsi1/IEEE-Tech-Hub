import React from 'react';
import { Users } from 'lucide-react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip as ChartTooltip,
  Legend
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, ChartTooltip, Legend);

const AnalyticsChart = ({ chartData }) => { 
  
  // 🌟 حماية الداتا: إذا مافي بيانات من الباك إند، نضع قيمة صفرية لمنع الكراش
  const safeData = Array.isArray(chartData) && chartData.length > 0 
    ? chartData 
    : [{ chapter: 'No Data', count: 0 }];

  // تجهيز الداتا لـ Chart.js
  const data = {
    labels: safeData.map(item => item?.chapter || item?.name || item?.label || 'Chapter'),
    datasets: [
      {
        label: 'Volunteers',
        data: safeData.map(item => item?.count || item?.value || item?.total || 0),
        backgroundColor: safeData.map((_, index) => index % 2 === 0 ? '#00629B' : '#3b82f6'),
        borderRadius: 8, 
        barThickness: 32, 
        borderSkipped: false,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    animation: {
      duration: 1500,
      easing: 'easeOutQuart',
    },
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#ffffff',
        titleColor: '#0f172a',
        bodyColor: '#64748b',
        borderColor: '#f1f5f9',
        borderWidth: 1,
        padding: 12,
        boxPadding: 6,
        usePointStyle: true,
        titleFont: { size: 13, weight: 'bold', family: 'sans-serif' },
        bodyFont: { size: 12, weight: 'bold', family: 'sans-serif' },
        callbacks: {
            label: (context) => ` ${context.raw} Volunteers`
        }
      },
    },
    scales: {
      x: {
        grid: { display: false, drawBorder: false },
        ticks: { color: '#94a3b8', font: { size: 11, weight: 'bold' } },
        border: { display: false }
      },
      y: {
        display: false,
        grid: { display: false },
        beginAtZero: true, 
        // 🌟 نسبة وتناسب: نعطي مساحة 20% إضافية فوق أطول عمود لجمالية التصميم
        suggestedMax: Math.max(...safeData.map(d => d.count || d.value || 0)) * 1.2 || 10,
      },
    },
  };

  return (
    <div className="bg-white p-8 rounded-[2.5rem] border border-slate-50 shadow-sm h-full flex flex-col min-h-[400px]">
      <div className="flex justify-between items-center mb-10">
        <div>
          <h3 className="text-slate-900 font-bold text-lg tracking-tight">Chapter Distribution</h3>
          <p className="text-slate-400 text-xs mt-1">Volunteers enrolled per technical chapter</p>
        </div>
        <div className="p-3 bg-blue-50 rounded-2xl shadow-inner shadow-blue-100/50">
          <Users className="text-[#00629B] w-5 h-5" />
        </div>
      </div>
      
      <div className="w-full relative h-[280px]">
        {/* 🌟 إذا مافي داتا حقيقية، نُظهر رسالة انتظار أنيقة */}
        {(!Array.isArray(chartData) || chartData.length === 0) && (
           <div className="absolute inset-0 flex items-center justify-center z-10 bg-white/60 backdrop-blur-[1px]">
              <span className="text-slate-400 text-[10px] font-black uppercase tracking-widest italic bg-white px-3 py-1 rounded-full shadow-sm">
                 Waiting for data...
              </span>
           </div>
        )}
        <Bar data={data} options={options} />
      </div>
    </div>
  );
};

export default AnalyticsChart;