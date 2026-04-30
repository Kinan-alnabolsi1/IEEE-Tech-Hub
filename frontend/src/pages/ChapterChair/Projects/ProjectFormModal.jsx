import React, { useState, useEffect } from 'react';
import { X, Save, Loader2 } from 'lucide-react';
import { projectService } from '../../../services/projectService';
import { volunteerService } from '../../../services/volunteerService'; 
import toast from 'react-hot-toast';

const ProjectFormModal = ({ isOpen, onClose, projectToEdit, onSuccess }) => {
    const [volunteers, setVolunteers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({ 
        title: '', 
        status: 'Open', 
        leader_id: '' 
    });

    // 🌟 جلب أعضاء الفصل (المتطوعين الفعالين فقط)
    useEffect(() => {
        const fetchVolunteers = async () => {
            try {
                const chapterId = localStorage.getItem('chapter_id');
                if (!chapterId) return;

                // مننادي الدالة الجديدة: منطلب المتطوعين (Volunteer) والفعالين (Active)
                const response = await volunteerService.getChapterMembers(chapterId, 'Volunteer', 'Active'); 
                
                if (response.data && response.data.data) {
                    setVolunteers(response.data.data);
                }
            } catch (error) {
                console.error("Error loading chapter members:", error);
            }
        };
        
        if (isOpen) fetchVolunteers();
    }, [isOpen]);

    // تعبئة البيانات في وضع التعديل
    useEffect(() => {
        if (projectToEdit) {
            setFormData({
                title: projectToEdit.title || '',
                status: projectToEdit.status || 'Open',
                leader_id: projectToEdit.leader_id || projectToEdit.leader?.user_id || ''
            });
        } else {
            setFormData({ title: '', status: 'Open', leader_id: '' });
        }
    }, [projectToEdit, isOpen]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.leader_id) {
            toast.error("Please select a project leader");
            return;
        }

        setLoading(true);
        const tid = toast.loading(projectToEdit ? "Updating..." : "Creating...");

        try {
            if (projectToEdit) {
                await projectService.updateProject(projectToEdit.project_id, formData);
                toast.success("Project updated!", { id: tid });
            } else {
                await projectService.createProject(formData);
                toast.success("Project launched!", { id: tid });
            }
            onSuccess();
        } catch (error) {
            toast.error(error.response?.data?.message || "Operation failed", { id: tid });
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
            <div className="bg-white w-full max-w-lg rounded-[40px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
                
                <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
                    <div>
                        <h2 className="text-2xl font-[900] text-[#005587] italic uppercase tracking-tight">
                            {projectToEdit ? 'Edit Project' : 'New Project'}
                        </h2>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.4em] mt-2 ml-1">Setup Metrics</p>
                    </div>
                    <button onClick={onClose} className="p-3 hover:bg-white rounded-2xl text-slate-400 transition-all shadow-sm">
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-8 space-y-6">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 italic">Project Title</label>
                        <input 
                            required
                            type="text"
                            value={formData.title}
                            onChange={(e) => setFormData({...formData, title: e.target.value})}
                            className="w-full bg-slate-50 border-none focus:ring-2 focus:ring-blue-100 rounded-2xl px-5 py-4 text-sm font-bold text-slate-700 outline-none transition-all"
                            placeholder="Ex: AI Hackathon"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 italic">Status</label>
                            <select 
                                value={formData.status}
                                onChange={(e) => setFormData({...formData, status: e.target.value})}
                                className="w-full bg-slate-50 border-none focus:ring-2 focus:ring-blue-100 rounded-2xl px-5 py-4 text-sm font-bold text-slate-700 outline-none cursor-pointer"
                            >
                                <option value="Open">Open</option>
                                <option value="Closed">Closed</option>
                            </select>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 italic">Leader</label>
                            <select 
                                required
                                value={formData.leader_id}
                                onChange={(e) => setFormData({...formData, leader_id: e.target.value})}
                                className="w-full bg-slate-50 border-none focus:ring-2 focus:ring-blue-100 rounded-2xl px-5 py-4 text-sm font-bold text-slate-700 outline-none cursor-pointer"
                            >
                                <option value="">Select Member</option>
                                {volunteers.map(v => (
                                    <option key={v.user_id} value={v.user_id}>
                                        {v.full_name}
                                    </option>
                                ))}
                                {projectToEdit && !volunteers.find(v => String(v.user_id) === String(formData.leader_id)) && (
                                    <option value={formData.leader_id}>{projectToEdit.leader?.full_name}</option>
                                )}
                            </select>
                        </div>
                    </div>

                    <button 
                        type="submit"
                        disabled={loading}
                        className="w-full py-5 bg-[#005587] text-white rounded-[22px] font-[900] text-[12px] uppercase tracking-[0.2em] shadow-xl shadow-blue-100 flex items-center justify-center gap-3 hover:-translate-y-1 active:scale-95 transition-all disabled:opacity-50 mt-4"
                    >
                        {loading ? <Loader2 className="animate-spin" size={18}/> : <Save size={18} />}
                        {projectToEdit ? 'Save Changes' : 'Launch Project'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ProjectFormModal;