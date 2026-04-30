import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Users, Layout, CheckCircle, ArrowUpRight, Loader2 } from 'lucide-react';
import ChapterHeader from '../components/ChapterHeader';

// 🚨 الـ API معلق تماماً عشان ما يضرب المتصفح
// import api from '../../../api/apiMethods'; 

const ChapterDashboard = () => {
  // سحبنا بيانات اليوزر بشكل آمن
  const outletContext = useOutletContext();
  const user = outletContext?.user || {}; 

  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    membersCount: 0,
    activeProjects: 0,
    completedTasks: 0,
  });

  useEffect(() => {
    // 🟡 داتا وهمية (Mock Data) لعرض التصميم فقط بدون أي API
    const loadMockData = () => {
      setLoading(true);
      
      /* // 🔴 الكود الحقيقي المجهز للربط لاحقاً:
      try {
        const chapterId = user?.chapter_id;
        const response = await api.get(`/chapters/${chapterId}/stats`);
        setStats(response.data.data);
      } catch (error) {
        console.error("Error fetching stats", error);
      }
      */

      // محاكاة التحميل
      setTimeout(() => {
        setStats({
          membersCount: 42,
          activeProjects: 5,
          completedTasks: 18,
        });
        setLoading(false);
      }, 800);
    };

    loadMockData();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <Loader2 className="animate-spin text-[#00629B]" size={40} />
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic">
          Loading Chapter Stats...
        </p>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 max-w-[1600px] mx-auto animate-in fade-in duration-500">
      
      {/* الهيدر الفخم */}
      <ChapterHeader 
        title="Chapter Dashboard" 
        subtitle="Overview of your chapter's performance" 
        chapterName={user?.chapter_name || "Computer Society"} 
      />

      {/* كروت الإحصائيات الوهمية */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        
        {/* كارت الأعضاء */}
        <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-md transition-all group">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-blue-50 p-4 rounded-2xl group-hover:scale-110 transition-transform">
              <Users className="w-7 h-7 text-blue-600" />
            </div>
            <ArrowUpRight className="w-5 h-5 text-slate-300" />
          </div>
          <p className="text-slate-400 text-[11px] font-black uppercase tracking-widest">Total Members</p>
          <h3 className="text-4xl font-black text-[#00629B] mt-2 italic">{stats.membersCount}</h3>
        </div>

        {/* كارت المشاريع */}
        <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-md transition-all group">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-orange-50 p-4 rounded-2xl group-hover:scale-110 transition-transform">
              <Layout className="w-7 h-7 text-orange-600" />
            </div>
            <ArrowUpRight className="w-5 h-5 text-slate-300" />
          </div>
          <p className="text-slate-400 text-[11px] font-black uppercase tracking-widest">Active Projects</p>
          <h3 className="text-4xl font-black text-[#00629B] mt-2 italic">{stats.activeProjects}</h3>
        </div>

        {/* كارت المهام */}
        <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-md transition-all group">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-green-50 p-4 rounded-2xl group-hover:scale-110 transition-transform">
              <CheckCircle className="w-7 h-7 text-green-600" />
            </div>
            <ArrowUpRight className="w-5 h-5 text-slate-300" />
          </div>
          <p className="text-slate-400 text-[11px] font-black uppercase tracking-widest">Completed Tasks</p>
          <h3 className="text-4xl font-black text-[#00629B] mt-2 italic">{stats.completedTasks}</h3>
        </div>

      </div>
    </div>
  );
};

export default ChapterDashboard;