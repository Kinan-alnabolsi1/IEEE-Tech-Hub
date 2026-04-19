import React from 'react';
import { Eye, FileDown, Tag, MapPin, Calendar } from 'lucide-react';

const ReportsTable = ({ reports, onView }) => {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left border-separate border-spacing-y-3">
        <thead>
          <tr className="text-[#00629B] opacity-40">
            <th className="px-8 py-2 text-[10px] font-black uppercase tracking-[0.2em]">Report Details</th>
            <th className="px-8 py-2 text-[10px] font-black uppercase tracking-[0.2em]">Source Branch</th>
            <th className="px-8 py-2 text-[10px] font-black uppercase tracking-[0.2em]">Type & Date</th>
            <th className="px-8 py-2 text-[10px] font-black uppercase tracking-[0.2em] text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {reports.map((report) => (
            <tr key={report.id} className="bg-white hover:shadow-md transition-all duration-300">
              <td className="px-8 py-5 rounded-l-[1.5rem] border-y border-l border-slate-50">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-blue-50 rounded-xl text-[#00629B]">
                    <FileDown className="w-5 h-5" />
                  </div>
                  <div className="flex flex-col">
                    <span className="font-black text-slate-700 text-xs uppercase italic">{report.title}</span>
                    <span className="text-[9px] font-bold text-slate-400 mt-0.5">By: {report.author}</span>
                  </div>
                </div>
              </td>
              <td className="px-8 py-5 border-y border-slate-50">
                <div className="flex items-center gap-2 text-slate-500">
                  <MapPin className="w-3.5 h-3.5 opacity-50" />
                  <span className="text-[10px] font-black uppercase tracking-wider">{report.branch}</span>
                </div>
              </td>
              <td className="px-8 py-5 border-y border-slate-50">
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2">
                    <Tag className="w-3 h-3 text-blue-400" />
                    <span className="text-[10px] font-bold text-slate-600">{report.type}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-3 h-3 text-slate-300" />
                    <span className="text-[9px] text-slate-400">{report.date}</span>
                  </div>
                </div>
              </td>
              <td className="px-8 py-5 rounded-r-[1.5rem] border-y border-r border-slate-50 text-right">
                <button 
                  onClick={() => onView(report)}
                  className="px-5 py-2.5 bg-[#00629B] text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-700 transition-colors shadow-lg shadow-blue-900/10"
                >
                  View Details
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ReportsTable;