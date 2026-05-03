import React, { useState, useEffect } from 'react';
import BaseModal from '@/components/ui/BaseModal'; // 🌟 الاستيراد الصح
import { Save, UserMinus, ShieldCheck, Loader2, AlertCircle } from 'lucide-react';
import { projectService } from '../../../services/projectService';
import toast from 'react-hot-toast';

const LeaderManagementModal = ({ isOpen, onClose, project, onSuccess }) => {
    const [applicants, setApplicants] = useState([]);
    const [selectedUserId, setSelectedUserId] = useState('');
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(false);

    useEffect(() => {
        if (isOpen && project) {
            fetchApplicants();
            setSelectedUserId('');
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isOpen, project]);

    const fetchApplicants = async () => {
        setFetching(true);
        try {
            const response = await projectService.getLeaderApplications(project.project_id);
            setApplicants(response.data?.data || []);
        } catch (error) {
            toast.error("Failed to load applicants list");
        } finally {
            setFetching(false);
        }
    };

    const handleAssignLeader = async () => {
        if (!selectedUserId) return toast.error("Please select an applicant.");
        setLoading(true);
        const tid = toast.loading("Assigning...");
        try {
            await projectService.assignProjectLeader(project.project_id, parseInt(selectedUserId));
            toast.success("Assigned successfully!", { id: tid });
            onSuccess(); 
        } catch (error) {
            toast.error(error.response?.data?.message || "Assignment failed", { id: tid });
        } finally {
            setLoading(false);
        }
    };

    const handleRemoveLeader = async () => {
        if (!window.confirm("Remove current leader?")) return;
        setLoading(true);
        const tid = toast.loading("Removing...");
        try {
            await projectService.removeProjectLeader(project.project_id);
            toast.success("Removed successfully!", { id: tid });
            onSuccess(); 
        } catch (error) {
            toast.error(error.response?.data?.message || "Removal failed", { id: tid });
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen || !project) return null;

    return (
        <BaseModal isOpen={isOpen} onClose={onClose} title="Manage Leader">
            <div className="space-y-6 mt-4">
                
                {/* 🌟 Current Leader */}
                <div className="space-y-1">
                    <label className="text-[9px] font-black uppercase tracking-[0.2em] text-[#005587] ml-2 block">Current Leader</label>
                    <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4">
                        {project.leader ? (
                            <div className="flex flex-col gap-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                                        <ShieldCheck size={18} />
                                    </div>
                                    <div className="overflow-hidden">
                                        <h4 className="text-sm font-black text-slate-800 truncate">{project.leader.full_name}</h4>
                                        <p className="text-[10px] font-bold text-slate-400">Project Leader</p>
                                    </div>
                                </div>
                                <button onClick={handleRemoveLeader} disabled={loading} className="w-full py-3 bg-white border border-rose-100 text-rose-500 font-black text-[9px] uppercase tracking-widest rounded-xl hover:bg-rose-50 transition-all flex justify-center gap-2">
                                    <UserMinus size={14} /> Remove Leader
                                </button>
                            </div>
                        ) : (
                            <p className="text-xs font-bold text-slate-400 italic text-center py-2">No leader assigned yet.</p>
                        )}
                    </div>
                </div>

                {/* 🌟 Assign New Leader */}
                <div className="space-y-1">
                    <label className="text-[9px] font-black uppercase tracking-[0.2em] text-[#005587] ml-2 block">Assign From Applicants</label>
                    {fetching ? (
                        <div className="flex items-center gap-2 text-xs font-bold text-slate-400 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                            <Loader2 size={16} className="animate-spin" /> Fetching...
                        </div>
                    ) : applicants.length === 0 ? (
                        <div className="flex items-center gap-2 text-xs font-bold text-amber-500 bg-amber-50 border border-amber-100 p-4 rounded-2xl">
                            <AlertCircle size={16} /> No pending applications found.
                        </div>
                    ) : (
                        <select 
                            value={selectedUserId} onChange={(e) => setSelectedUserId(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-100 focus:border-[#005587] rounded-2xl px-5 py-4 text-xs font-bold text-slate-700 outline-none cursor-pointer"
                        >
                            <option value="" disabled>-- Select Applicant --</option>
                            {applicants.map(app => (
                                <option key={app.user_id} value={app.user_id}>{app.full_name}</option>
                            ))}
                        </select>
                    )}
                </div>

                {/* Actions */}
                <div className="pt-2 flex gap-3">
                    <button type="button" onClick={onClose} disabled={loading} className="flex-1 py-4 text-[9px] font-black uppercase tracking-widest text-slate-400 border border-slate-100 rounded-2xl hover:bg-slate-50 transition-colors">
                        Close
                    </button>
                    <button onClick={handleAssignLeader} disabled={loading || !selectedUserId} className="flex-[2] flex justify-center items-center gap-2 bg-[#005587] text-white py-4 text-[9px] font-black uppercase tracking-widest rounded-2xl shadow-xl shadow-blue-900/20 active:scale-95 transition-all disabled:opacity-50">
                        {loading ? <Loader2 className="animate-spin" size={16}/> : <Save size={16} />}
                        Approve & Assign
                    </button>
                </div>

            </div>
        </BaseModal>
    );
};

export default LeaderManagementModal;