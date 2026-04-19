import React, { useState, useEffect } from 'react';
import { adminService } from '../../../services/adminService';
import { Users, Layout, MapPin, TrendingUp, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

// 🌟 استيراد مكتبة Chart.js بدلاً من recharts
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip as ChartTooltip,
  Filler,
} from 'chart.js';
import { Line } from 'react-chartjs-2';

// 🌟 تسجيل إضافات Chart.js
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, ChartTooltip, Filler);

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const res = await adminService.getDashboardStats();
        setStats(res.data);
      } catch (err) {
        // 🌟 ضفنا هدول السطرين لنعرف المشكلة بالتفصيل
        console.error("🔥 DASHBOARD FETCH ERROR:", err.response || err);
        toast.error(`Sync failed: ${err.response?.status || 'Network Error'}`);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  if (loading) return (
    <div className="flex flex-col items-center justify-center h-[80vh] space-y-4">
      <Loader2 className="animate-spin text-[#00629B]" size={40} />
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic">Syncing Stats...</p>
    </div>
  );

  const cards = [
    { label: 'Total Branches', value: stats?.cards?.total_branches, icon: <Layout />, color: 'blue' },
    { label: 'Volunteers', value: stats?.cards?.total_volunteers, icon: <Users />, color: 'emerald' },
    { label: 'Branch Admins', value: stats?.cards?.total_branch_admins, icon: <MapPin />, color: 'indigo' },
    { label: 'Active Projects', value: stats?.cards?.active_projects, icon: <TrendingUp />, color: 'amber' },
  ];

let rawChartData = [];
  
  if (Array.isArray(stats?.charts?.volunteers_growth) && stats.charts.volunteers_growth.length > 0) {
      // نأخذ نسخة من بيانات الباك إند
      rawChartData = [...stats.charts.volunteers_growth];
      
      // 🌟 السحر هنا: إذا الباك إند أرسل شهر واحد فقط، نضيف نقطة انطلاق من الصفر ليرسم الخط!
      if (rawChartData.length === 1) {
          rawChartData.unshift({ month: 'Start', count: 0 });
      }
  } else {
      // إذا لم يرسل شيء أبداً
      rawChartData = [{ month: 'No Data', count: 0 }];
  }

  const chartDataConfig = {
    labels: rawChartData.map(item => {
        if (item.month === 'No Data') return item.month;
        const parts = item.month.split('-');
        return parts.length > 1 ? `${parts[1]}/${parts[0].slice(2)}` : item.month;
    }),
    datasets: [
      {
        label: 'Registrations',
        data: rawChartData.map(item => item.count || 0),
        fill: true,
        backgroundColor: (context) => {
          const ctx = context.chart?.ctx;
          if (!ctx) return 'rgba(0, 98, 155, 0.2)';
          const gradient = ctx.createLinearGradient(0, 0, 0, 300);
          gradient.addColorStop(0, 'rgba(0, 98, 155, 0.25)'); 
          gradient.addColorStop(1, 'rgba(0, 98, 155, 0)');    
          return gradient;
        },
        borderColor: '#00629B',
        borderWidth: 4,
        tension: 0.4, // انحناء سلس
        pointRadius: 0, 
        pointHoverRadius: 6, 
        pointBackgroundColor: '#ffffff',
        pointBorderColor: '#00629B',
        pointBorderWidth: 2,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false, // 🌟 يمنع الخطأ ويسمح بتمدد الشارت
    animation: { duration: 1500, easing: 'easeOutQuart' },
    interaction: { mode: 'index', intersect: false },
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#00629B', 
        titleColor: '#ffffff',
        bodyColor: '#e2e8f0',
        padding: 12,
        displayColors: false, 
        titleFont: { size: 12, weight: 'bold' },
        bodyFont: { size: 14, weight: 'bold' },
        callbacks: {
            label: (context) => `+${context.raw} Members`
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
        suggestedMax: Math.max(...rawChartData.map(d => d.count || 0)) * 1.2, 
      },
    },
  };

  return (
    <div className="p-4 space-y-10 animate-in fade-in duration-700">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-black text-[#00629B] uppercase italic tracking-tighter">IEEE Overview</h1>
        <p className="text-[10px] text-slate-400 font-bold tracking-[0.4em] uppercase">Live Infrastructure Metrics</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {cards.map((card, i) => (
          <div key={i} className="bg-white p-7 rounded-[2.5rem] border border-slate-100 shadow-sm group hover:shadow-md transition-all">
            {/* ملاحظة: تأكدي أن ألوان Tailwind هذه معرّفة في tailwind.config أو استخدمي ألوان ثابتة إذا لم تظهر الخلفية */}
            <div className={`w-12 h-12 rounded-2xl bg-${card.color}-50 text-${card.color}-600 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
              {card.icon}
            </div>
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{card.label}</p>
            <p className="text-3xl font-black text-slate-800 mt-1 italic tracking-tighter">
              {card.value || 0}
            </p>
          </div>
        ))}
      </div>

      {/* Chart Section */}
      <div className="bg-white p-8 rounded-[3rem] border border-slate-50 shadow-sm overflow-hidden">
        <div className="mb-8">
          <h2 className="text-xl font-black text-slate-800 uppercase italic">Volunteer Growth</h2>
          <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-1 italic">Monthly Registration Flow</p>
        </div>
        
        {/* 🌟 الحل النهائي: إعطاء ارتفاع ثابت وصريح للـ div المغلّف */}
        <div className="w-full relative h-[300px]">
           {stats?.charts?.volunteers_growth?.length === 0 && (
             <div className="absolute inset-0 flex items-center justify-center z-10 bg-white/60 backdrop-blur-[1px]">
                <span className="text-slate-400 text-[10px] font-black uppercase tracking-widest italic bg-white px-3 py-1 rounded-full shadow-sm">
                   Waiting for data...
                </span>
             </div>
           )}
           <Line data={chartDataConfig} options={chartOptions} />
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;