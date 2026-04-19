import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getSuperAdminStats } from '../../services/dashboardService'; // الربط الجديد
import StatCards from './dashboard/components/StatCards';
import AnalyticsChart from './dashboard/components/AnalyticsChart';
import DistributionPie from './dashboard/components/DistributionPie';
import Loader from '../../components/ui/Loader';
import toast from 'react-hot-toast';

const SuperAdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchStats = async () => {
      // التأكد من وجود التوكن
      const token = localStorage.getItem('ieee_token');
      if (!token) {
        navigate('/login');
        return;
      }

      try {
        setLoading(true);
        // استخدام السيرفس لجلب البيانات
        const response = await getSuperAdminStats();
        
        if (response.data) {
          setStats(response.data);
          console.log("%c [Dashboard] Data Synced Successfully ✅", "color: #00629B; font-weight: bold;");
        }
      } catch (err) {
        // إذا كان الخطأ 401 (غير مصرح) يعني التوكن انتهى
        if (err.response?.status === 401) {
          localStorage.removeItem('ieee_token');
          navigate('/login');
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

  // حالة التحميل (Loading)
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[80vh]">
        <Loader message="Synchronizing IEEE Infrastructure Data..." />
      </div>
    );
  }

  // في حال فشل جلب البيانات
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
        <StatCards cards={stats.cards} />
      </section>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Growth Chart */}
        <div className="lg:col-span-2 bg-white p-2 rounded-[2.5rem] shadow-sm border border-slate-50 overflow-hidden">
          <AnalyticsChart chartData={stats.charts?.volunteers_growth} />
        </div>

        {/* Region Distribution */}
        <div className="lg:col-span-1 bg-white p-2 rounded-[2.5rem] shadow-sm border border-slate-50 overflow-hidden">
          <DistributionPie pieData={stats.charts?.branches_by_region} />
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