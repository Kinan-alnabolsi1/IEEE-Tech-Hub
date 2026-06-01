import React, { useState, useEffect } from 'react';
import { Layers, Link as LinkIcon, Database } from 'lucide-react';
import SocietyTable from './SocietyTable';
import AddSocietyModal from './AddSocietyModal';
import EditSocietyModal from './EditSocietyModal';
import SocietyBranchLink from './SocietyBranchLink';
import { societyService } from '../../../../services/societyService'; 
import toast from 'react-hot-toast';
import Loader from '../../../../components/ui/Loader';

const SocietiesIndex = () => {
  const [activeTab, setActiveTab] = useState('list');
  const [societies, setSocieties] = useState([]); 
  const [loading, setLoading] = useState(true);
  
  // Modals State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedSociety, setSelectedSociety] = useState(null);

  const fetchSocieties = async () => {
    try {
      setLoading(true);
      const res = await societyService.getAll();
      const serverData = res.data?.data || res.data || [];
      setSocieties(Array.isArray(serverData) ? serverData : []);
    } catch (err) {
      toast.error("Failed to sync with server database" , err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSocieties();
  }, []);

  const handleAddSociety = async (payload) => {
    try {
      await societyService.create(payload);
      toast.success("Society Added Successfully!");
      setIsAddModalOpen(false);
      fetchSocieties(); 
    } catch (err) {
      toast.error(err.response?.data?.message || "Creation Failed");
    }
  };

  const openEditModal = (society) => {
    setSelectedSociety(society);
    setIsEditModalOpen(true);
  };

  const handleEditSociety = async (id, payload) => {
    try {
      await societyService.update(id, payload);
      toast.success("Society Updated Successfully!");
      setIsEditModalOpen(false);
      fetchSocieties(); 
    } catch (err) {
      toast.error("Failed to update society" ,err);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Confirm deletion from database?")) {
      try {
        await societyService.delete(id);
        toast.success("Society Erased");
        fetchSocieties();
      } catch (err) {
        toast.error("Server Rejected Deletion",err);
      }
    }
  };

  if (loading && societies.length === 0) return <Loader />;

  return (
    <div className="p-4 md:p-8 lg:p-12 min-h-screen bg-[#FBFDFF]">
      
      {/* 🌟 Responsive Header: Stacks on mobile, side-by-side on larger screens */}
      <div className="max-w-7xl mx-auto mb-8 md:mb-12 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-[#00629B] rounded-xl"><Database className="w-6 h-6 text-white" /></div>
            <h1 className="text-3xl md:text-4xl font-black text-[#00629B] uppercase italic tracking-tighter">Societies</h1>
          </div>
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.3em]">Live Server Data</p>
        </div>

        {activeTab === 'list' && (
          <button 
            onClick={() => setIsAddModalOpen(true)}
            className="w-full md:w-auto bg-[#00629B] text-white px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-blue-900/10 active:scale-95 transition-all text-center"
          >
            + Add Society
          </button>
        )}
      </div>

      {/* 🌟 Responsive Tabs: Allow wrapping on very small screens */}
      <div className="max-w-7xl mx-auto flex flex-wrap gap-2 mb-10 bg-slate-100/50 p-1.5 rounded-3xl w-full sm:w-fit">
        <button 
          onClick={() => setActiveTab('list')}
          className={`flex-1 sm:flex-none flex items-center justify-center gap-2 md:gap-3 px-4 md:px-8 py-3.5 rounded-2xl text-[9px] md:text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'list' ? 'bg-white text-[#00629B] shadow-sm' : 'text-slate-400'}`}
        >
          <Layers className="w-3.5 h-3.5 md:w-4 md:h-4" /> <span className="hidden sm:inline">Society</span> Directory
        </button>
        <button 
          onClick={() => setActiveTab('link')}
          className={`flex-1 sm:flex-none flex items-center justify-center gap-2 md:gap-3 px-4 md:px-8 py-3.5 rounded-2xl text-[9px] md:text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'link' ? 'bg-white text-[#00629B] shadow-sm' : 'text-slate-400'}`}
        >
          <LinkIcon className="w-3.5 h-3.5 md:w-4 md:h-4" /> Branch <span className="hidden sm:inline">Association</span>
        </button>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto">
        {activeTab === 'list' ? (
          <SocietyTable 
            societies={societies} 
            onDelete={handleDelete} 
            onEdit={openEditModal} 
          />
        ) : (
          <SocietyBranchLink societies={societies} />
        )}
      </div>

      {/* Modals */}
      <AddSocietyModal 
        isOpen={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)} 
        onAdd={handleAddSociety}
        existingSocieties={societies} 
      />

      <EditSocietyModal 
        isOpen={isEditModalOpen} 
        onClose={() => setIsEditModalOpen(false)} 
        onEdit={handleEditSociety}
        societyData={selectedSociety}
      />
    </div>
  );
};

export default SocietiesIndex;