import React, { useState, useEffect } from 'react';
import { adminService } from '../../../services/adminService';
import { Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import StatCards from './components/StatCards'; // استيراد الكروت
import AnalyticsChart from './components/AnalyticsChart'; // استيراد الشارت

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

// AdminDashboard.jsx
useEffect(() => {
  const loadData = async () => {
    try {
      setLoading(true);
      
      // 🌟 جلب الـ ID مباشرة من الـ LocalStorage
      const branchId = localStorage.getItem('branch_id');

      console.log("Checking Branch ID from storage:", branchId);

      if (!branchId || branchId === "undefined" || branchId === "null") {
        toast.error("Branch Identity not found. Please re-login.");
        setLoading(false);
        return;
      }

      const res = await adminService.getBranchDashboardStats(branchId);
      setStats(res.data?.data || res.data);

    } catch (err) {
      console.error("Dashboard Fetch Error:", err);
      toast.error("Failed to fetch branch statistics");
    } finally {
      setLoading(false);
    }
  };

  loadData();
}, []);

  if (loading) return (
    <div className="flex flex-col items-center justify-center h-[80vh] space-y-4">
      <Loader2 className="animate-spin text-[#00629B]" size={40} />
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic">Syncing Branch Stats...</p>
    </div>
  );

  return (
    <div className="p-4 space-y-10 animate-in fade-in duration-700">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-black text-[#00629B] uppercase italic tracking-tighter">Branch Overview</h1>
        <p className="text-[10px] text-slate-400 font-bold tracking-[0.4em] uppercase">Live Performance Metrics</p>
      </div>

      {/* 🌟 كروت الإحصائيات - نمرر لها stats.cards */}
      <StatCards stats={stats?.cards} />

      {/* 🌟 شارت التوزيع - نمرر له stats.charts.volunteers_per_chapter */}
      <div className="grid grid-cols-1 gap-6">
         <AnalyticsChart chartData={stats?.charts?.volunteers_per_chapter} />
      </div>
    </div>
  );
};

export default AdminDashboard;