import React from 'react';
import { Users, MapPin, Briefcase, Clock, ArrowUpRight } from 'lucide-react';

const stats = [
  { title: "Total Branches", value: "24", icon: MapPin, trend: "+2", color: "text-blue-600 bg-blue-100" },
  { title: "Total Volunteers", value: "1,240", icon: Users, trend: "+12%", color: "text-indigo-600 bg-indigo-100" },
  { title: "Active Projects", value: "45", icon: Briefcase, trend: "+5", color: "text-emerald-600 bg-emerald-100" },
  { title: "Pending Requests", value: "12", icon: Clock, trend: "New", color: "text-amber-600 bg-amber-100" },
];

const StatCards = () => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
    {stats.map((stat, index) => (
      <div key={index} className="bg-white p-6 rounded-[2rem] border border-slate-50 shadow-sm hover:shadow-md transition-shadow">
        <div className="flex justify-between items-start mb-4">
          <div className={`p-3 rounded-2xl ${stat.color}`}>
            <stat.icon className="w-6 h-6" />
          </div>
          <span className="text-green-500 text-[10px] font-bold bg-green-50 px-2 py-1 rounded-full flex items-center">
            {stat.trend} <ArrowUpRight className="w-3 h-3 ml-1" />
          </span>
        </div>
        <h3 className="text-slate-400 text-[9px] font-black uppercase tracking-widest">{stat.title}</h3>
        <p className="text-2xl font-bold text-slate-900 mt-1">{stat.value}</p>
      </div>
    ))}
  </div>
);

export default StatCards;