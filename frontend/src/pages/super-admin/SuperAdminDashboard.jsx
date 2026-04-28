import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getSuperAdminStats } from '../../services/dashboardService'; 
import StatCards from './dashboard/components/StatCards';
import DistributionPie from './dashboard/components/DistributionPie'; // 🌟 شارت الدونات فقط
import Loader from '../../components/ui/Loader';
import toast from 'react-hot-toast';

// 🌟 استيراد مكاتب شارت الخط (النمو) ليعمل مباشرة داخل الداشبورد
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

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, ChartTooltip, Filler);

const SuperAdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchStats = async () => {
      const token = localStorage.getItem('ieee_token');
      if (!token) {
        navigate('/');
        return;
      }

      try {
        setLoading(true);
        const response = await getSuperAdminStats();
        
        if (response.data) {
          const dataPayload = response.data?.data || response.data;
          setStats(dataPayload);
        }
      } catch (err) {
        if (err.response?.status === 401) {
          localStorage.removeItem('ieee_token');
          navigate('/');
          toast.error("Session expired. Please login again.");
        } else {
          toast.error("Failed to sync system analytics");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [navigate]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[80vh]">
        <Loader message="Synchronizing IEEE Infrastructure Data..." />
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="p-20 text-center">
        <div className="inline-block p-6 bg-white rounded-[2rem] shadow-sm border border-slate-50">
          <p className="text-sm font-black text-slate-300 uppercase tracking-widest italic">
            No live data available at the moment.
          </p>
        </div>
      </div>
    );
  }

  // ==========================================
  // 🌟 إعدادات شارت الخط (Volunteer Growth)
  // ==========================================
  let rawGrowthData = [];
  if (Array.isArray(stats.charts?.volunteers_growth) && stats.charts.volunteers_growth.length > 0) {
      rawGrowthData = [...stats.charts.volunteers_growth];
      if (rawGrowthData.length === 1) {
          rawGrowthData.unshift({ month: 'Start', count: 0 });
      }
  } else {
      rawGrowthData = [{ month: 'No Data', count: 0 }];
  }

  const lineChartData = {
    labels: rawGrowthData.map(item => {
        if (!item || !item.month) return '';
        if (item.month === 'No Data' || item.month === 'Start') return item.month;
        const parts = item.month.split('-');
        return parts.length > 1 ? `${parts[1]}/${parts[0].slice(2)}` : item.month;
    }),
    datasets: [
      {
        label: 'Registrations',
        data: rawGrowthData.map(item => item?.count || 0),
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
        tension: 0.4, 
        pointRadius: (rawGrowthData.length === 2 && rawGrowthData[0].month === 'Start') ? 6 : 0, 
        pointHoverRadius: 6, 
        pointBackgroundColor: '#ffffff',
        pointBorderColor: '#00629B',
        pointBorderWidth: 2,
      },
    ],
  };

  const lineChartOptions = {
    responsive: true,
    maintainAspectRatio: false, 
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
        callbacks: { label: (context) => `+${context.raw} Members` }
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
        suggestedMax: Math.max(...rawGrowthData.map(d => d.count || 0), 10) * 1.2, 
      },
    },
  };

  return (
    <div className="p-6 md:p-8 space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* Header Section */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b border-slate-50 pb-8">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-[9px] font-black text-emerald-600 uppercase tracking-[0.3em]">System Online</span>
          </div>
          <h1 className="text-5xl font-black text-[#00629B] uppercase tracking-tighter italic">
            System Analytics
          </h1>
          <p className="text-[11px] text-slate-400 font-bold uppercase tracking-[0.4em] ml-1 mt-2">
            Real-time overview of the IEEE Portal activity
          </p>
        </div>
        
        <div className="bg-white px-6 py-3 rounded-2xl shadow-sm border border-slate-50">
          <span className="text-[10px] font-black text-[#00629B] uppercase tracking-widest">
            {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
          </span>
        </div>
      </header>

      {/* Cards Section */}
      <section className="relative z-10">
        <StatCards cards={stats.cards || {}} />
      </section>

      {/* 🌟 Charts Grid (شارتين فقط كما طلبتِ) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* 1. Growth Chart (Line Chart المدمج) */}
        <div className="lg:col-span-2 bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-50  flex flex-col">
          <div className="mb-8">
            <h2 className="text-xl font-black text-slate-800 uppercase italic">Volunteer Growth</h2>
            <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-1 italic">Monthly Registration Flow</p>
          </div>
          <div className="w-full relative flex-1 min-h-[280px]">
             {rawGrowthData[0].month === 'No Data' && (
               <div className="absolute inset-0 flex items-center justify-center z-10 bg-white/60 backdrop-blur-[1px]">
                  <span className="text-slate-400 text-[10px] font-black uppercase tracking-widest italic bg-white px-3 py-1 rounded-full shadow-sm">
                     Waiting for data...
                  </span>
               </div>
             )}
             <Line data={lineChartData} options={lineChartOptions} />
          </div>
        </div>

        {/* 2. Region Distribution (شارت الدونات) */}
        <div className="lg:col-span-1">
          <DistributionPie pieData={stats.charts?.branches_by_region || []} />
        </div>

      </div>

      {/* Footer Section */}
      <footer className="pt-10 text-center border-t border-slate-50">
        <p className="text-[9px] font-bold text-slate-300 uppercase tracking-widest">
          IEEE Tech-Hub Management Platform • SuperAdmin Access Secure
        </p>
      </footer>
    </div>
  );
};

export default SuperAdminDashboard;