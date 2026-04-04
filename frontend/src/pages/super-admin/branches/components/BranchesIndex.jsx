import React, { useState, useEffect } from 'react';
import { Plus, Search } from 'lucide-react';
import BranchTable from './BranchTable'; 
import AddBranchModal from './AddBranchModal';

const BranchesIndex = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [branches, setBranches] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  const users = [{ id: 1, name: "Shahed Al-Ahmad" }, { id: 2, name: "Ahmad Mahmoud" }];

  useEffect(() => {
    const data = [
      { id: 1, name: "AIU Student Branch", region: "Damascus", manager: "Shahed Al-Ahmad", established_at: "2023-10-12", status: "Active" },
      { id: 2, name: "Damascus University", region: "Damascus", manager: "Ahmad Mahmoud", established_at: "2021-05-20", status: "Active" },
      { id: 3, name: "Aleppo Tech", region: "Aleppo", manager: "Sami Yassin", established_at: "2022-01-15", status: "Inactive" },
    ];
    setBranches(data);
  }, []);

  return (
    <div className="p-6 md:p-12 min-h-screen bg-[#FBFDFF]">
      {/* Header Section */}
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center mb-12 gap-6">
        <div className="text-center md:text-left">
          <h1 className="text-4xl font-black text-[#00629B] uppercase tracking-tighter italic">IEEE Branches</h1>
          <div className="h-1 w-20 bg-blue-500 mt-2 mx-auto md:mx-0 rounded-full"></div>
        </div>

        <div className="flex gap-4 w-full md:w-auto">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
            <input 
              type="text" 
              placeholder="Filter..." 
              className="bg-white border-none shadow-sm rounded-2xl pl-12 pr-4 py-4 w-full md:w-64 text-sm font-bold focus:ring-2 focus:ring-blue-100 transition-all outline-none"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="bg-[#00629B] text-white px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-blue-900/20 active:scale-95 transition-all"
          >
            Add Branch
          </button>
        </div>
      </div>

      {/* Table Section - السر هنا هو overflow-visible على الحاوية */}
      <div className="max-w-7xl mx-auto overflow-x-auto overflow-y-visible pb-64">
        <div className="inline-block min-w-full align-middle">
          <BranchTable 
            branches={branches.filter(b => b.name.toLowerCase().includes(searchTerm.toLowerCase()))} 
            onEdit={(b) => alert(b.name)}
            onDelete={(id) => setBranches(branches.filter(b => b.id !== id))}
            onToggleStatus={(b) => {
              setBranches(branches.map(i => i.id === b.id ? {...i, status: i.status === 'Active' ? 'Inactive' : 'Active'} : i));
            }}
          />
        </div>
      </div>

      <AddBranchModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} users={users} onAdd={(nb) => setBranches([...branches, {...nb, id: Date.now(), status: 'Active'}])} />
    </div>
  );
};

export default BranchesIndex;