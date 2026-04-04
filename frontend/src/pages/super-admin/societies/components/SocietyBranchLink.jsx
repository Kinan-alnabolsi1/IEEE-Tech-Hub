import React, { useState } from 'react';
import { Link as LinkIcon, Building2, Check, ArrowRight, ShieldCheck } from 'lucide-react';

const SocietyBranchLink = ({ societies }) => {
  const [selectedBranch, setSelectedBranch] = useState("");
  const [selectedSocieties, setSelectedSocieties] = useState([]);

  // فروع وهمية (Mock) - لاحقاً منجيبها من الـ API
  const branches = [
    { id: 1, name: "AIU Student Branch", region: "Damascus" },
    { id: 2, name: "Damascus University SB", region: "Damascus" },
    { id: 3, name: "Aleppo University SB", region: "Aleppo" },
  ];

  const toggleSociety = (id) => {
    setSelectedSocieties(prev => 
      prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
    );
  };

  const handleLinkSubmit = () => {
    // المنطق البرمجي للربط POST /api/branches/{id}/societies
    alert(`Linking branch ${selectedBranch} with societies: ${selectedSocieties.join(", ")}`);
  };

  return (
    <div className="max-w-6xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* العمود اليسار: اختيار الفرع */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-sm">
            <div className="flex items-center gap-3 mb-8">
              <div className="p-2.5 bg-blue-50 rounded-xl text-[#00629B]">
                <Building2 className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-black text-slate-700 uppercase tracking-widest">Select Target Branch</h3>
            </div>
            
            <div className="space-y-4">
              {branches.map((branch) => (
                <div 
                  key={branch.id}
                  onClick={() => setSelectedBranch(branch.id)}
                  className={`p-5 rounded-2xl border-2 transition-all cursor-pointer flex justify-between items-center ${
                    selectedBranch === branch.id 
                    ? 'border-[#00629B] bg-blue-50/30 shadow-md' 
                    : 'border-slate-50 bg-slate-50/50 hover:bg-white hover:border-slate-200'
                  }`}
                >
                  <div className="flex flex-col">
                    <span className="text-xs font-black text-slate-700 uppercase">{branch.name}</span>
                    <span className="text-[10px] text-slate-400 font-bold uppercase mt-1">{branch.region}</span>
                  </div>
                  {selectedBranch === branch.id && <ShieldCheck className="w-5 h-5 text-[#00629B]" />}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* العمود اليمين: اختيار الجمعيات */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-sm">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-blue-50 rounded-xl text-[#00629B]">
                  <LinkIcon className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-black text-slate-700 uppercase tracking-widest">Available Societies</h3>
              </div>
              <span className="text-[10px] font-black text-slate-400 bg-slate-50 px-3 py-1 rounded-full uppercase">
                {selectedSocieties.length} Selected
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-10">
              {societies.map((soc) => (
                <div 
                  key={soc.id}
                  onClick={() => toggleSociety(soc.id)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center gap-3 ${
                    selectedSocieties.includes(soc.id)
                    ? 'border-[#00629B] bg-[#00629B] text-white shadow-lg'
                    : 'border-slate-100 bg-white hover:border-blue-200'
                  }`}
                >
                  <div className={`p-2 rounded-lg ${selectedSocieties.includes(soc.id) ? 'bg-white/20 text-white' : 'bg-blue-50 text-[#00629B]'}`}>
                    <Check className={`w-3.5 h-3.5 ${selectedSocieties.includes(soc.id) ? 'opacity-100' : 'opacity-0'}`} />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[11px] font-black uppercase tracking-tight">{soc.name}</span>
                    <span className={`text-[9px] font-bold uppercase opacity-60`}>{soc.abbreviation}</span>
                  </div>
                </div>
              ))}
            </div>

            <button 
              disabled={!selectedBranch || selectedSocieties.length === 0}
              onClick={handleLinkSubmit}
              className="w-full bg-[#00629B] text-white py-5 rounded-[1.8rem] text-[10px] font-black uppercase tracking-[0.2em] shadow-2xl shadow-blue-900/20 disabled:opacity-30 disabled:grayscale transition-all active:scale-95 flex items-center justify-center gap-3"
            >
              Confirm Branch Association <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default SocietyBranchLink;