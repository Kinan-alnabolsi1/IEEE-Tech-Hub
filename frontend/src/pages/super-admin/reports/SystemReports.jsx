import React, { useState, useEffect } from 'react';
import { FileText, Search, Filter, Calendar, LayoutGrid } from 'lucide-react';
import ReportsTable from './components/ReportsTable';
import ReportDetailsDrawer from './components/ReportDetailsDrawer';

const SystemReports = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBranch, setSelectedBranch] = useState('All');
  const [selectedReport, setSelectedReport] = useState(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // بيانات وهمية للتقارير
  const mockReports = [
    { id: 1, title: "Annual Activity Report", branch: "AIU Student Branch", type: "Annual", date: "2026-03-15", status: "Verified", author: "Shahed Abd", content: "Detailed content about AIU branch activities..." },
    { id: 2, title: "Technical Workshop Summary", branch: "Damascus University", type: "Technical", date: "2026-03-20", status: "Pending", author: "Ahmad Ali", content: "Summary of the React.js workshop held last week..." },
    { id: 3, title: "Financial Audit Q1", branch: "Aleppo Branch", type: "Financial", date: "2026-04-01", status: "Verified", author: "Sami Homsi", content: "Financial statement for the first quarter of 2026..." },
  ];

  const handleViewDetails = (report) => {
    setSelectedReport(report);
    setIsDrawerOpen(true);
  };

  const filteredReports = mockReports.filter(report => 
    (selectedBranch === 'All' || report.branch === selectedBranch) &&
    report.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6 md:p-12 min-h-screen bg-[#FBFDFF]">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-10">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2.5 bg-[#00629B] rounded-2xl shadow-lg shadow-blue-100">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-4xl font-black text-[#00629B] uppercase tracking-tighter italic">System Reports</h1>
            </div>
            <p className="text-[11px] text-slate-400 font-bold uppercase tracking-[0.4em] ml-1">Comprehensive Monitoring & Auditing</p>
          </div>

          {/* Quick Stats */}
          <div className="flex gap-4">
            <div className="bg-white p-4 rounded-2xl border border-slate-50 shadow-sm flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-[#00629B] font-black">{mockReports.length}</div>
              <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest leading-none">Total<br/>Reports</span>
            </div>
          </div>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="max-w-7xl mx-auto mb-8 bg-white p-4 rounded-[2rem] border border-slate-50 shadow-sm flex flex-wrap gap-4 items-center">
        <div className="relative flex-1 min-w-[250px]">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
          <input 
            type="text" 
            placeholder="Search by report title..." 
            className="w-full bg-slate-50/50 border-none rounded-xl pl-12 pr-4 py-3 text-xs font-bold outline-none focus:ring-2 focus:ring-blue-100 transition-all"
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <select 
          className="bg-slate-50/50 border-none rounded-xl px-4 py-3 text-xs font-bold outline-none focus:ring-2 focus:ring-blue-100 cursor-pointer text-slate-500"
          onChange={(e) => setSelectedBranch(e.target.value)}
        >
          <option value="All">All Branches</option>
          <option value="AIU Student Branch">AIU Student Branch</option>
          <option value="Damascus University">Damascus University</option>
        </select>

        <button className="p-3 bg-slate-50 hover:bg-slate-100 rounded-xl text-slate-400 transition-colors">
          <Calendar className="w-4 h-4" />
        </button>
      </div>

      {/* Table Section */}
      <div className="max-w-7xl mx-auto">
        <ReportsTable 
          reports={filteredReports} 
          onView={handleViewDetails} 
        />
      </div>

      {/* Drawer Component */}
      <ReportDetailsDrawer 
        report={selectedReport} 
        isOpen={isDrawerOpen} 
        onClose={() => setIsDrawerOpen(false)} 
      />
    </div>
  );
};

export default SystemReports;