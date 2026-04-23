import React, { useState, useEffect } from 'react';
import { Link as LinkIcon, Building2, Check, ArrowRight, ShieldCheck, Search, Loader2 } from 'lucide-react';
import { branchService } from '../../../../services/branchService';
import { societyService } from '../../../../services/societyService';
import toast from 'react-hot-toast';

const SocietyBranchLink = ({ societies }) => {
  const [branches, setBranches] = useState([]);
  const [loadingBranches, setLoadingBranches] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [selectedBranch, setSelectedBranch] = useState(null);
  const [selectedSocieties, setSelectedSocieties] = useState([]);

  const [branchSearch, setBranchSearch] = useState("");
  const [societySearch, setSocietySearch] = useState("");

  const fetchBranches = async () => {
    try {
      setLoadingBranches(true);
      const res = await branchService.getAll();
      const serverData = res.data?.data || res.data || [];
      setBranches(Array.isArray(serverData) ? serverData : []);
    } catch (err) {
      toast.error("Failed to load branches");
    } finally {
      setLoadingBranches(false);
    }
  };

  useEffect(() => {
    fetchBranches();
  }, []);

  // جلب بيانات الفرع والجمعيات المرتبطة به عند الاختيار
  const handleSelectBranch = async (branch) => {
    const branchId = branch.id || branch.branch_id;
    setSelectedBranch(branch);
    
    try {
      setIsSubmitting(true);
      const res = await branchService.getById(branchId);
      const attachedData = res.data?.societies || res.data?.data?.societies || [];
      const linkedIds = attachedData.map(soc => soc.id || soc.society_id);
      setSelectedSocieties(linkedIds);
    } catch (err) {
      toast.error("Error syncing branch data");
      setSelectedSocieties([]);
    } finally {
      setIsSubmitting(false);
    }
  };

  // 🌟 تعديل الـ Toggle ليكون متوافقاً مع الـ DELETE API
  const toggleSociety = async (socId) => {
    if (!selectedBranch) {
      toast.error("Please select a branch first");
      return;
    }

    const branchId = selectedBranch.id || selectedBranch.branch_id;
    const isCurrentlyLinked = selectedSocieties.includes(socId);

    try {
      if (isCurrentlyLinked) {
        // ❌ عملية الحذف (Detach)
        await societyService.detachFromBranch(branchId, socId);
        setSelectedSocieties(prev => prev.filter(id => id !== socId));
        toast.success("Association removed");
      } else {
        // ✅ عملية الربط (Attach)
        // نرسله كـ Array [socId] لأن الباك إند يتوقع مصفوفة في الـ Attach
        await societyService.attachToBranch(branchId, [socId]);
        setSelectedSocieties(prev => [...prev, socId]);
        toast.success("Association added");
      }
    } catch (err) {
      console.error("Toggle Error:", err);
      toast.error(err.response?.data?.message || "Operation failed");
    }
  };

  const filteredBranches = branches.filter(b => 
    (b.name || b.branch_name || '').toLowerCase().includes(branchSearch.toLowerCase())
  );

  const filteredSocieties = societies
    .filter(s => (s.status || 'Active').toLowerCase() === 'active')
    .filter(s => 
      (s.name || '').toLowerCase().includes(societySearch.toLowerCase()) ||
      (s.abbreviation || '').toLowerCase().includes(societySearch.toLowerCase())
    );

  return (
    <div className="max-w-7xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700 pb-10">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* COLUMN 1: BRANCHES */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm min-h-[500px]">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2.5 bg-blue-50 rounded-xl text-[#00629B]">
                <Building2 className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-black text-slate-700 uppercase tracking-widest">Select Branch</h3>
            </div>

            <div className="relative mb-6">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
              <input 
                type="text" 
                placeholder="Search branches..." 
                value={branchSearch}
                onChange={(e) => setBranchSearch(e.target.value)}
                className="w-full bg-slate-50 border border-slate-100 rounded-2xl pl-11 pr-4 py-3.5 text-xs font-bold outline-none focus:ring-2 focus:ring-blue-100 transition-all"
              />
            </div>
            
            <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 no-scrollbar">
              {loadingBranches ? (
                <div className="flex justify-center py-10"><Loader2 className="w-6 h-6 text-[#00629B] animate-spin" /></div>
              ) : (
                filteredBranches.map((branch, index) => {
                  const branchId = branch.id || branch.branch_id;
                  const isSelected = selectedBranch && (selectedBranch.id || selectedBranch.branch_id) === branchId;

                  return (
                    <div 
                      key={branchId || index}
                      onClick={() => handleSelectBranch(branch)}
                      className={`p-5 rounded-2xl border-2 transition-all cursor-pointer flex justify-between items-center ${
                        isSelected 
                        ? 'border-[#00629B] bg-blue-50/30 shadow-md' 
                        : 'border-slate-50 bg-slate-50/50 hover:bg-white hover:border-slate-200'
                      }`}
                    >
                      <div className="flex flex-col">
                        <span className="text-xs font-black text-slate-700 uppercase">{branch.name || branch.branch_name}</span>
                        <span className="text-[10px] text-slate-400 font-bold uppercase mt-1">
                          {branch.region || 'IEEE Branch'}
                        </span>
                      </div>
                      {isSelected && <ShieldCheck className="w-5 h-5 text-[#00629B]" />}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* COLUMN 2: SOCIETIES */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm min-h-[500px] flex flex-col">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-blue-50 rounded-xl text-[#00629B]">
                  <LinkIcon className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-black text-slate-700 uppercase tracking-widest">Available Societies</h3>
              </div>
              <span className="text-[10px] font-black text-[#00629B] bg-blue-50 px-3 py-1 rounded-full uppercase">
                {selectedSocieties.length} Selected
              </span>
            </div>

            <div className="relative mb-6">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
              <input 
                type="text" 
                placeholder="Search societies..." 
                value={societySearch}
                onChange={(e) => setSocietySearch(e.target.value)}
                className="w-full bg-slate-50 border border-slate-100 rounded-2xl pl-11 pr-4 py-3.5 text-xs font-bold outline-none focus:ring-2 focus:ring-blue-100 transition-all"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-8 flex-1 overflow-y-auto content-start pr-2 no-scrollbar">
              {filteredSocieties.map((soc, index) => {
                const socId = soc.id || soc.society_id;
                const isChecked = selectedSocieties.includes(socId);

                return (
                  <div 
                    key={socId || index}
                    onClick={() => toggleSociety(socId)}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center gap-3 ${
                      isChecked
                      ? 'border-[#00629B] bg-[#00629B] text-white shadow-lg shadow-blue-900/20'
                      : 'border-slate-100 bg-white hover:border-blue-200'
                    }`}
                  >
                    <div className={`p-1.5 rounded-lg transition-colors ${isChecked ? 'bg-white/20 text-white' : 'bg-blue-50 text-[#00629B]'}`}>
                      <Check className={`w-3.5 h-3.5 transition-opacity ${isChecked ? 'opacity-100' : 'opacity-0'}`} />
                    </div>
                    <div className="flex flex-col overflow-hidden">
                      <span className="text-[11px] font-black uppercase tracking-tight truncate">{soc.name}</span>
                      <span className={`text-[9px] font-bold uppercase ${isChecked ? 'opacity-80' : 'text-slate-400'}`}>
                        {soc.abbreviation || soc.abbr}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
               <p className="text-[9px] font-bold text-slate-400 uppercase text-center italic">
                 Changes are saved automatically upon selection
               </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default SocietyBranchLink;