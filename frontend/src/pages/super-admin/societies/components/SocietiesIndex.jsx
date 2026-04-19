import React, { useState, useEffect } from 'react';
import { Layers, Link as LinkIcon, Database } from 'lucide-react';
import SocietyTable from './SocietyTable';
import AddSocietyModal from './AddSocietyModal';
import EditSocietyModal from './EditSocietyModal'; // الاستيراد الجديد
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

      console.log(serverData, "Data from API");

      setSocieties(Array.isArray(serverData) ? serverData : []);
    } catch (err) {
      toast.error("Failed to sync with server database");
    } finally {
      setLoading(false);
    }

    console.log(isEditModalOpen)

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

  // وظيفة فتح نافذة التعديل
  const openEditModal = (society) => {
    setSelectedSociety(society);
    setIsEditModalOpen(true);
  };

  // وظيفة إرسال بيانات التعديل للباك إند
  const handleEditSociety = async (id, payload) => {
    try {
      await societyService.update(id, payload);
      toast.success("Society Updated Successfully!");
      setIsEditModalOpen(false);
      fetchSocieties(); 
    } catch (err) {
      toast.error("Failed to update society");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Confirm deletion from database?")) {
      try {
        await societyService.delete(id);
        toast.success("Society Erased");
        fetchSocieties();
      } catch (err) {
        toast.error("Server Rejected Deletion");
      }
    }
  };

  if (loading && societies.length === 0) return <Loader />;

  return (
    <div className="p-6 md:p-12 min-h-screen bg-[#FBFDFF]">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-12 flex justify-between items-center">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-[#00629B] rounded-xl"><Database className="w-6 h-6 text-white" /></div>
            <h1 className="text-4xl font-black text-[#00629B] uppercase italic tracking-tighter">Societies</h1>
          </div>
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.3em]">Live Server Data</p>
        </div>

        {activeTab === 'list' && (
          <button 
            onClick={() => setIsAddModalOpen(true)}
            className="bg-[#00629B] text-white px-8 py-4 rounded-[1.5rem] text-[10px] font-black uppercase tracking-widest shadow-xl shadow-blue-900/10 active:scale-95 transition-all"
          >
            + Add Society
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="max-w-7xl mx-auto flex gap-2 mb-10 bg-slate-100/50 p-1.5 rounded-[1.8rem] w-fit">
        <button 
          onClick={() => setActiveTab('list')}
          className={`flex items-center gap-3 px-8 py-3.5 rounded-[1.5rem] text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'list' ? 'bg-white text-[#00629B] shadow-sm' : 'text-slate-400'}`}
        >
          <Layers className="w-4 h-4" /> Society Directory
        </button>
        <button 
          onClick={() => setActiveTab('link')}
          className={`flex items-center gap-3 px-8 py-3.5 rounded-[1.5rem] text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'link' ? 'bg-white text-[#00629B] shadow-sm' : 'text-slate-400'}`}
        >
          <LinkIcon className="w-4 h-4" /> Branch Association
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