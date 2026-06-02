import React, { useState, useEffect } from 'react';
import { Users, Layers, Clock, Briefcase, ArrowUpRight } from 'lucide-react';
import { getChapterStats } from '../../../services/dashboardService'; 
import Loader from '../../../components/ui/Loader';
import toast from 'react-hot-toast';

const ChapterDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const chapterId = localStorage.getItem('chapter_id');
        const response = await getChapterStats(chapterId);
        if (response.data && response.data.data) {
          setStats(response.data.data.cards);
        }
      } catch (error) {
        toast.error("Failed to load statistics",error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) return <Loader message="Live Performance Metrics..." />;

  return (
    <div className="p-2 animate-in fade-in duration-700">
      {/* --- Unified System Header --- */}
      <div className="mb-12">
        <h1 className="text-[38px] font-[900] text-[#005587] italic tracking-tight leading-none uppercase">
          Chapter Overview
        </h1>
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.4em] mt-3 ml-1">
          Live Performance Metrics
        </p>
      </div>

      {/* --- Statistics Grid --- */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        <StatCard 
          icon={<Users size={22} />} 
          color="bg-blue-50 text-blue-600" 
          label="Total Volunteers" 
          value={stats?.total_members} 
        />
        <StatCard 
          icon={<Layers size={22} />} 
          color="bg-indigo-50 text-indigo-600" 
          label="Active Projects" 
          value={stats?.total_projects} 
        />
        <StatCard 
          icon={<Clock size={22} />} 
          color="bg-amber-50 text-amber-600" 
          label="Pending Requests" 
          value={stats?.ongoing_projects} 
        />
        <StatCard 
          icon={<Briefcase size={22} />} 
          color="bg-emerald-50 text-emerald-600" 
          label="Ongoing Projects" 
          value={stats?.completed_projects} 
        />
      </div>
    </div>
  );
};

// --- المكون الفرعي للكارت (مطابق للصورة) ---
const StatCard = ({ icon, color, label, value }) => (
  <div className="bg-white p-8 rounded-[40px] shadow-[0_10px_30px_rgba(0,0,0,0.04)] border border-slate-50 relative group transition-all hover:shadow-xl hover:-translate-y-1">
    {/* Live Badge */}
    {/* <div className="absolute top-8 right-8 flex items-center gap-1.5 bg-slate-50 px-2.5 py-1 rounded-full">
      <span className="text-[8px] font-black text-slate-400 uppercase tracking-tighter">Live</span>
      <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse"></span>
    </div> */}

    {/* Icon Wrapper */}
    <div className={`${color} w-16 h-16 rounded-[22px] flex items-center justify-center mb-10`}>
      {icon}
    </div>

    {/* Content */}
    <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.15em] mb-3 leading-none">
      {label}
    </p>
    <h3 className="text-[44px] font-[900] text-slate-800 italic leading-none tracking-tighter">
      {value ?? 0}
    </h3>
  </div>
);

export default ChapterDashboard;