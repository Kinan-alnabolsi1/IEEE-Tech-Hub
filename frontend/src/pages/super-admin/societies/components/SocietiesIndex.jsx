import React, { useState, useEffect } from 'react';
import { Plus, Search, Layers, Link as LinkIcon, Database } from 'lucide-react';
import SocietyTable from './SocietyTable';
import AddSocietyModal from './AddSocietyModal';
import SocietyBranchLink from './SocietyBranchLink';

const SocietiesIndex = () => {
  const [activeTab, setActiveTab] = useState('list');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [societies, setSocieties] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    // بانتظار الـ API الحقيقي GET /api/societies
    const mockSocieties = [
      { id: 1, name: "Computer Society", abbreviation: "CS", classification: "Technical", status: "Active" },
      { id: 2, name: "Robotics & Automation Society", abbreviation: "RAS", classification: "Technical", status: "Active" },
      { id: 3, name: "Women in Engineering", abbreviation: "WIE", classification: "Affinity Group", status: "Active" },
    ];
    setSocieties(mockSocieties);
  }, []);

  return (
    <div className="p-6 md:p-12 min-h-screen bg-[#FBFDFF]">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-12 flex flex-col md:flex-row justify-between items-center gap-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-[#00629B] rounded-xl">
              <Database className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-4xl font-black text-[#00629B] uppercase tracking-tighter italic">Societies</h1>
          </div>
          <p className="text-[11px] text-slate-400 font-bold uppercase tracking-[0.4em] ml-1">Global Technical Management</p>
        </div>

        <div className="flex gap-4">
           {activeTab === 'list' && (
             <button 
               onClick={() => setIsModalOpen(true)}
               className="bg-[#00629B] text-white px-8 py-4 rounded-[1.5rem] text-[10px] font-black uppercase tracking-widest shadow-xl shadow-blue-900/10 active:scale-95 transition-all"
             >
               + Create Society
             </button>
           )}
        </div>
      </div>

      {/* Custom Tabs */}
      <div className="max-w-7xl mx-auto flex gap-2 mb-10 bg-slate-100/50 p-1.5 rounded-[1.8rem] w-fit">
        <button 
          onClick={() => setActiveTab('list')}
          className={`flex items-center gap-3 px-8 py-3.5 rounded-[1.5rem] text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'list' ? 'bg-white text-[#00629B] shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
        >
          <Layers className="w-4 h-4" /> Society Directory
        </button>
        <button 
          onClick={() => setActiveTab('link')}
          className={`flex items-center gap-3 px-8 py-3.5 rounded-[1.5rem] text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'link' ? 'bg-white text-[#00629B] shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
        >
          <LinkIcon className="w-4 h-4" /> Branch Association
        </button>
      </div>

      <div className="max-w-7xl mx-auto">
        {activeTab === 'list' ? (
          <div className="animate-in fade-in duration-500">
             <div className="relative mb-8 max-w-md">
                <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                <input 
                  type="text" 
                  placeholder="Search societies..." 
                  className="w-full bg-white border border-slate-50 shadow-sm rounded-2xl pl-12 pr-4 py-4 text-xs font-bold outline-none focus:ring-4 focus:ring-blue-50 transition-all"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
             </div>
             <div className="overflow-x-auto overflow-y-visible pb-40">
                <SocietyTable 
                  societies={societies.filter(s => s.name.toLowerCase().includes(searchTerm.toLowerCase()))}
                  onDelete={(id) => setSocieties(societies.filter(s => s.id !== id))}
                  onEdit={(s) => console.log(s)}
                />
             </div>
          </div>
        ) : (
          <SocietyBranchLink societies={societies} />
        )}
      </div>

      <AddSocietyModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onAdd={(newSoc) => setSocieties([{...newSoc, id: Date.now(), status: 'Active'}, ...societies])}
      />
    </div>
  );
};

export default SocietiesIndex;