import React, { useState, useEffect } from 'react';
import BranchTable from './BranchTable'; 
import BranchModal from './BranchModal';
import { branchService } from '../../../../services/branchService';
import { getData } from '../../../../api/apiMethods';
import toast from 'react-hot-toast';
import Loader from '../../../../components/ui/Loader';

const BranchesIndex = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBranch, setEditingBranch] = useState(null);
  const [branches, setBranches] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [branchesRes, usersRes] = await Promise.all([
        branchService.getAll(),
        getData('/users?role=Branch Admin')
      ]);
      setBranches(branchesRes.data || branchesRes || []);
      const uData = usersRes.data?.data || usersRes.data || usersRes;
      setUsers(Array.isArray(uData) ? uData : []);
    } catch (err) { toast.error("Sync Failure"); } 
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const handleSaveBranch = async (formData) => {
    try {
      // إجبار البيانات أن تكون أرقام ونصوص نظيفة للسيرفر
      const payload = {
        name: String(formData.name).trim(),
        region: String(formData.region).trim(),
        description: formData.description || "IEEE Branch",
        admin_id: parseInt(formData.admin_id, 10)
      };

      if (editingBranch) {
        await branchService.update(editingBranch.branch_id, payload);
        toast.success("Branch Infrastructure Updated!");
      } else {
        await branchService.create(payload);
        toast.success("New Branch Integrated!");
      }
      setIsModalOpen(false);
      fetchData();
    } catch (err) {
      console.error("422 Error Detail:", err.response?.data);
      const msg = err.response?.data?.errors?.admin_id?.[0] || err.response?.data?.message || "Operation Failed";
      toast.error(msg);
    }
  };

  if (loading) return <Loader message="Accessing Mainframe..." />;

  return (
    <div className="p-6 md:p-12 min-h-screen">
       <div className="flex justify-between items-center mb-10">
          <div>
            <h1 className="text-4xl font-black text-[#00629B] uppercase italic tracking-tighter">Manage Branches</h1>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.3em] mt-1">IEEE Branch Management Platform</p>
          </div>
          <button 
            onClick={() => { setEditingBranch(null); setIsModalOpen(true); }}
            className="bg-[#00629B] text-white px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-xl shadow-blue-900/20 hover:scale-105 active:scale-95 transition-all"
          >
            + Add New Branch
          </button>
       </div>
       
       <BranchTable 
         branches={branches} 
         onEdit={(b) => { setEditingBranch(b); setIsModalOpen(true); }}
         onDelete={(id) => { if(confirm("Delete?")) branchService.delete(id).then(fetchData); }}
         onToggleStatus={(b) => branchService.toggleStatus(b.branch_id, b.status).then(fetchData)}
       />

       <BranchModal 
         isOpen={isModalOpen} 
         onClose={() => setIsModalOpen(false)} 
         users={users} 
         initialData={editingBranch} 
         onSave={handleSaveBranch} 
       />
    </div>
  );
};

export default BranchesIndex;