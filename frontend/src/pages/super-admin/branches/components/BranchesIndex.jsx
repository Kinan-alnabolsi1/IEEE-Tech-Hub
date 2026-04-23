import React, { useState, useEffect } from 'react';
import BranchTable from './BranchTable'; 
import BranchModal from './BranchModal';
import { branchService } from '../../../../services/branchService';
import toast from 'react-hot-toast';
import Loader from '../../../../components/ui/Loader';

const BranchesIndex = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBranch, setEditingBranch] = useState(null);
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      setLoading(true);
      const branchesRes = await branchService.getAll();
      setBranches(branchesRes.data || branchesRes || []);
      
    } catch (err) { 
      console.error("Fetch Error:", err); 
      toast.error("Sync Failure"); 
    } finally { 
      setLoading(false); 
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleSaveBranch = async (formData) => {
    try {
      const payload = {
        name: formData.name.trim(),
        region: formData.region.trim(),
        description: formData.description?.trim() || null,
        contact_email: formData.contact_email?.trim() || null,
        contact_phone: formData.contact_phone?.trim() || null,
        founded_date: formData.founded_date || null,
      };

      if (editingBranch) {
        await branchService.update(editingBranch.branch_id || editingBranch.id, payload);
        toast.success("Branch Infrastructure Updated!");
      } else {
        await branchService.create(payload);
        toast.success("New Branch Integrated!");
      }
      setIsModalOpen(false);
      fetchData();
    } catch (err) {
      console.error("Error Detail:", err.response?.data);
      const msg = err.response?.data?.message || "Operation Failed";
      toast.error(msg);
    }
  };

  if (loading) return <Loader message="Accessing Mainframe..." />;

  return (
    <div className="p-4 md:p-8 lg:p-12 min-h-screen">
       {/* 🌟 Responsive Header: بيكونوا تحت بعض عالموبايل وجنب بعض عالشاشات الكبيرة */}
       <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
          <div>
            <h1 className="text-3xl md:text-4xl font-black text-[#00629B] uppercase italic tracking-tighter">Manage Branches</h1>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.3em] mt-1">IEEE Branch Management Platform</p>
          </div>
          <button 
            onClick={() => { setEditingBranch(null); setIsModalOpen(true); }}
            className="w-full md:w-auto bg-[#00629B] text-white px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-xl shadow-blue-900/20 hover:scale-105 active:scale-95 transition-all text-center"
          >
            + Add New Branch
          </button>
       </div>
       
       <BranchTable 
         branches={branches} 
         onEdit={(b) => { setEditingBranch(b); setIsModalOpen(true); }}
         onDelete={(id) => { if(window.confirm("Delete?")) branchService.delete(id).then(fetchData); }}
         onToggleStatus={(b) => branchService.toggleStatus(b.branch_id || b.id, b.status).then(fetchData)}
       />

       <BranchModal 
         isOpen={isModalOpen} 
         onClose={() => setIsModalOpen(false)} 
         initialData={editingBranch} 
         onSave={handleSaveBranch} 
       />
    </div>
  );
};

export default BranchesIndex;