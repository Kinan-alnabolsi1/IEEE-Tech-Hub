import React, { useState, useEffect } from 'react';
import { ShieldCheck, Clock, Search, Ban } from 'lucide-react';
import AdminTable from './components/AdminTable';
import { adminService } from '../../../services/adminService'; // تأكدي من المسار الصحيح
import toast from 'react-hot-toast';

const AdminsManagement = () => {
  const [activeTab, setActiveTab] = useState('pending');
  const [searchTerm, setSearchTerm] = useState('');
  const [admins, setAdmins] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch data from API whenever the activeTab changes
  const fetchAdmins = async () => {
    try {
      setIsLoading(true);
      // ارسال الطلب للـ API مع حالة التاب الحالي
      const response = await adminService.getBranchAdmins(activeTab);
      
      // نفترض أن الرد يأتي بـ response.data.data كما هو موضح من البوست مان
      const fetchedData = response.data?.data || response.data || [];
      setAdmins(fetchedData);
    } catch (error) {
      toast.error(`Failed to fetch ${activeTab} admins`);
      setAdmins([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAdmins();
  }, [activeTab]);

  // Handle status updates (Approve, Suspend, Reactivate, Reject)
  const handleStatusChange = async (id, newStatus) => {
    try {
      // 1. إرسال التحديث للباك إند
      await adminService.updateAdminStatus(id, newStatus);
      toast.success(`Admin status updated to ${newStatus}`);
      
      // 2. تحديث الواجهة فوراً بجلب البيانات من جديد لإخفاء المستخدم من التاب الحالي
      fetchAdmins();
    } catch (error) {
      toast.error("Failed to update status. Please try again.");
    }
  };

  // Filter based on search input (Client-side search)
  const filteredAdmins = admins.filter(admin => {
    const adminName = admin.full_name || admin.name || '';
    const adminBranch = admin.branch || '';
    return adminName.toLowerCase().includes(searchTerm.toLowerCase()) || 
           adminBranch.toLowerCase().includes(searchTerm.toLowerCase());
  });

  return (
    <div className="p-6 md:p-12 min-h-screen bg-[#FBFDFF]">
      {/* Header Section */}
      <div className="max-w-7xl mx-auto mb-10 flex flex-col md:flex-row justify-between items-end gap-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2.5 bg-[#00629B] rounded-2xl shadow-lg shadow-blue-100">
              <ShieldCheck className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-4xl font-black text-[#00629B] uppercase tracking-tighter italic">Admin Control</h1>
          </div>
          <p className="text-[11px] text-slate-400 font-bold uppercase tracking-[0.4em] ml-1">Approval Queue & Access Management</p>
        </div>

        <div className="relative w-full md:w-80">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
          <input 
            type="text" 
            placeholder="Search admins..." 
            className="w-full bg-white border border-slate-50 shadow-sm rounded-2xl pl-12 pr-4 py-4 text-xs font-bold outline-none focus:ring-4 focus:ring-blue-50 transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Tabs Section - Added Suspended Tab */}
      <div className="max-w-7xl mx-auto flex flex-wrap gap-2 mb-8 bg-slate-100/50 p-1.5 rounded-[2rem] w-fit animate-in fade-in duration-700">
        <button 
          onClick={() => setActiveTab('pending')}
          className={`flex items-center gap-3 px-6 py-4 rounded-[1.6rem] text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'pending' ? 'bg-[#00629B] text-white shadow-xl' : 'text-slate-400 hover:text-slate-600 hover:bg-white/50'}`}
        >
          <Clock className="w-4 h-4" /> Pending Requests
        </button>
        <button 
          onClick={() => setActiveTab('active')}
          className={`flex items-center gap-3 px-6 py-4 rounded-[1.6rem] text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'active' ? 'bg-[#00629B] text-white shadow-xl' : 'text-slate-400 hover:text-slate-600 hover:bg-white/50'}`}
        >
          <ShieldCheck className="w-4 h-4" /> Active Admins
        </button>
        <button 
          onClick={() => setActiveTab('suspended')}
          className={`flex items-center gap-3 px-6 py-4 rounded-[1.6rem] text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'suspended' ? 'bg-red-500 text-white shadow-xl shadow-red-200' : 'text-slate-400 hover:text-slate-600 hover:bg-white/50'}`}
        >
          <Ban className="w-4 h-4" /> Suspended
        </button>
      </div>

      {/* Table Section */}
      <div className="max-w-7xl mx-auto animate-in fade-in slide-in-from-bottom-6 duration-1000">
        <AdminTable 
          data={filteredAdmins} 
          type={activeTab} 
          isLoading={isLoading}
          onAction={handleStatusChange} 
        />
      </div>
    </div>
  );
};

export default AdminsManagement;