import React from 'react';
import { X, FileText, User, Calendar, MapPin, Tag, Download, Printer } from 'lucide-react';

const ReportDetailsDrawer = ({ report, isOpen, onClose }) => {
  if (!report) return null;

  return (
    <>
      {/* Backdrop (الخلفية الشفافة خلف النافذة) */}
      <div 
        className={`fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[150] transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
      />

      {/* Drawer Panel */}
      <div className={`fixed right-0 top-0 h-full w-full max-w-lg bg-white shadow-2xl z-[160] transform transition-transform duration-500 ease-in-out ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        
        {/* Header */}
        <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-[#00629B] text-white">
          <div>
            <h2 className="text-xl font-black uppercase italic tracking-tighter">Report Details</h2>
            <p className="text-[10px] text-blue-200 font-bold uppercase tracking-widest mt-1 italic">Reviewing Branch Submission</p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-xl transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-8 overflow-y-auto h-[calc(100vh-180px)] custom-scrollbar">
          
          {/* Main Title Section */}
          <div className="mb-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 text-[#00629B] rounded-lg mb-4">
              <Tag className="w-3 h-3" />
              <span className="text-[10px] font-black uppercase">{report.type}</span>
            </div>
            <h3 className="text-2xl font-black text-slate-800 uppercase leading-tight">{report.title}</h3>
          </div>

          {/* Info Grid */}
          <div className="grid grid-cols-2 gap-6 mb-10">
            <div className="flex flex-col gap-1">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Submitted By</span>
              <div className="flex items-center gap-2 text-slate-700 font-bold">
                <User className="w-4 h-4 text-blue-500" />
                <span className="text-xs italic">{report.author}</span>
              </div>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Source Branch</span>
              <div className="flex items-center gap-2 text-slate-700 font-bold">
                <MapPin className="w-4 h-4 text-blue-500" />
                <span className="text-xs uppercase">{report.branch}</span>
              </div>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Submission Date</span>
              <div className="flex items-center gap-2 text-slate-700 font-bold">
                <Calendar className="w-4 h-4 text-blue-500" />
                <span className="text-xs">{report.date}</span>
              </div>
            </div>
          </div>

          <hr className="border-slate-100 mb-8" />

          {/* Report Body */}
          <div className="mb-10">
            <h4 className="text-xs font-black text-slate-800 uppercase tracking-widest mb-4 flex items-center gap-2">
              <FileText className="w-4 h-4 text-[#00629B]" /> Report Content
            </h4>
            <div className="bg-slate-50/50 p-6 rounded-3xl border border-slate-100 min-h-[200px]">
              <p className="text-slate-600 text-sm leading-relaxed font-medium">
                {report.content}
              </p>
            </div>
          </div>

          {/* Attachments Section */}
          <div>
            <h4 className="text-xs font-black text-slate-800 uppercase tracking-widest mb-4">Attachments</h4>
            <div className="flex items-center justify-between p-4 bg-white border-2 border-dashed border-slate-100 rounded-2xl group hover:border-blue-200 transition-colors cursor-pointer">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-red-50 text-red-500 rounded-lg">
                  <FileText className="w-5 h-5" />
                </div>
                <div className="flex flex-col">
                  <span className="text-[11px] font-bold text-slate-700">Official_Report.pdf</span>
                  <span className="text-[9px] text-slate-400 uppercase">2.4 MB</span>
                </div>
              </div>
              <Download className="w-5 h-5 text-slate-300 group-hover:text-blue-500 transition-colors" />
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="absolute bottom-0 left-0 w-full p-8 border-t border-slate-50 bg-white flex gap-4">
          <button className="flex-1 py-4 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-slate-800 transition-all shadow-xl flex items-center justify-center gap-2">
            <Download className="w-4 h-4" /> Download PDF
          </button>
          <button className="p-4 bg-slate-50 text-slate-400 rounded-2xl hover:bg-slate-100 transition-all border border-slate-100">
            <Printer className="w-5 h-5" />
          </button>
        </div>
      </div>
    </>
  );
};

export default ReportDetailsDrawer;