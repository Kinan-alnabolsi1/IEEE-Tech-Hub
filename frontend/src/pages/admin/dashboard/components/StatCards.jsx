import React from 'react';
import { Users, Layers, Clock, Briefcase } from 'lucide-react';

const StatCards = ({ stats = {} }) => {
  const statsConfig = [
    { 
      title: "Total Volunteers", 
      value: stats?.total_volunteers || 0, 
      icon: Users, 
      color: "text-blue-600 bg-blue-50" 
    },
    { 
      title: "Active Chapters", 
      value: stats?.active_chapters || 0, 
      icon: Layers, 
      color: "text-indigo-600 bg-indigo-50" 
    },
    { 
      title: "Pending Requests", 
      value: stats?.pending_requests || 0, 
      icon: Clock, 
      color: "text-amber-600 bg-amber-50" 
    },
    { 
      title: "Ongoing Projects", 
      value: stats?.ongoing_projects || 0, 
      icon: Briefcase, 
      color: "text-emerald-600 bg-emerald-50" 
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {statsConfig.map((stat, index) => (
        <div key={index} className="bg-white p-7 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-md transition-all group">
          <div className="flex justify-between items-start mb-6">
            <div className={`p-3 rounded-2xl ${stat.color} transition-transform group-hover:scale-110`}>
              <stat.icon className="w-6 h-6" />
            </div>
            <div className="flex items-center gap-1 bg-slate-50 px-2 py-1 rounded-full">
               <span className="text-[8px] font-black text-slate-400 uppercase tracking-tighter">Live</span>
               <div className="w-1 h-1 bg-emerald-500 rounded-full animate-pulse" />
            </div>
          </div>
          <h3 className="text-slate-400 text-[9px] font-black uppercase tracking-[0.2em] mb-1">{stat.title}</h3>
          <p className="text-3xl font-black text-slate-800 italic tracking-tighter">
            {stat.value.toLocaleString()}
          </p>
        </div>
      ))}
    </div>
  );
};

export default StatCards;