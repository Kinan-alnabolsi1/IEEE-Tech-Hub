import React from 'react';
import { Users, Layers, Clock, Briefcase } from 'lucide-react';

const StatCards = ({ stats = {} }) => {
  const statsConfig = [
    { title: "Total Volunteers", value: stats.total_volunteers || 0, icon: Users, color: "text-blue-600 bg-blue-100" },
    { title: "Active Chapters", value: stats.active_chapters || 0, icon: Layers, color: "text-indigo-600 bg-indigo-100" },
    { title: "Pending Requests", value: stats.pending_requests || 0, icon: Clock, color: "text-amber-600 bg-amber-100" },
    { title: "Ongoing Projects", value: stats.ongoing_projects || 0, icon: Briefcase, color: "text-emerald-600 bg-emerald-100" },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {statsConfig.map((stat, index) => (
        <div key={index} className="bg-white p-6 rounded-[2.5rem] border border-slate-50 shadow-sm hover:shadow-md transition-all group">
          <div className="flex justify-between items-start mb-4">
            <div className={`p-3 rounded-2xl ${stat.color} transition-transform group-hover:scale-110`}>
              <stat.icon className="w-6 h-6" />
            </div>
            <span className="text-blue-500 text-[9px] font-black uppercase tracking-tighter bg-blue-50 px-2 py-1 rounded-full flex items-center">
              Live <div className="w-1.5 h-1.5 bg-blue-500 rounded-full ml-1 animate-pulse" />
            </span>
          </div>
          <h3 className="text-slate-400 text-[9px] font-black uppercase tracking-widest leading-none">{stat.title}</h3>
          <p className="text-3xl font-bold text-slate-900 mt-2 tracking-tight">{stat.value.toLocaleString()}</p>
        </div>
      ))}
    </div>
  );
};

export default StatCards;