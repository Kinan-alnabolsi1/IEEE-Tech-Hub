import React, { useState, useEffect } from 'react';
import BaseModal from '@/components/ui/BaseModal'; 
import { Save, Loader2, Plus, Trash2 } from 'lucide-react';
import { projectService } from '../../../services/projectService';
import toast from 'react-hot-toast';

const ProjectFormModal = ({ isOpen, onClose, projectToEdit, onSuccess }) => {
    const [loading, setLoading] = useState(false);
    
    const [formData, setFormData] = useState({ 
        title: '', 
        description: '',
        status: 'Open', 
        start_date: '',
        end_date: '',
        required_roles: [{ role_name: '', required_count: 1 }]
    });

    useEffect(() => {
        if (projectToEdit && isOpen) {
            const formatDate = (dateStr) => dateStr ? dateStr.substring(0, 10) : '';

            setFormData({
                title: projectToEdit.title || '',
                description: projectToEdit.description || '',
                status: projectToEdit.status || 'Open',
                start_date: formatDate(projectToEdit.start_date),
                end_date: formatDate(projectToEdit.end_date), 
                required_roles: projectToEdit.required_roles?.length ? projectToEdit.required_roles : []
            });
        } else {
            setFormData({ 
                title: '', description: '', status: 'Open', start_date: '', end_date: '',
                required_roles: [{ role_name: '', required_count: 1 }]
            });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [projectToEdit, isOpen]);

    const handleAddRole = () => setFormData({ ...formData, required_roles: [...formData.required_roles, { role_name: '', required_count: 1 }] });
    const handleRemoveRole = (index) => setFormData({ ...formData, required_roles: formData.required_roles.filter((_, i) => i !== index) });
    const handleRoleChange = (index, field, value) => {
        const newRoles = [...formData.required_roles];
        newRoles[index][field] = value;
        setFormData({ ...formData, required_roles: newRoles });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        const chapterId = localStorage.getItem('chapter_id');
        if (!chapterId) return toast.error("Chapter ID not found!");

        const cleanRoles = formData.required_roles
            .filter(role => role.role_name && role.role_name.trim() !== '')
            .map(role => ({ role_name: role.role_name.trim(), required_count: parseInt(role.required_count) || 1 }));

        if (!projectToEdit && cleanRoles.length === 0) return toast.error("Please add at least one valid role.");
        if (!formData.start_date || !formData.end_date) return toast.error("Please select both dates.");

        const payload = {
            title: formData.title, description: formData.description,
            start_date: formData.start_date, end_date: formData.end_date,
            chapter_id: parseInt(chapterId)
        };

        if (cleanRoles.length > 0 || !projectToEdit) payload.required_roles = cleanRoles;
        if (!projectToEdit) payload.status = formData.status;

        setLoading(true);
        const tid = toast.loading(projectToEdit ? "Updating Project..." : "Creating Project...");

        try {
            if (projectToEdit) {
                await projectService.updateProject(projectToEdit.project_id, payload);
                if (projectToEdit.status !== formData.status) {
                    await projectService.updateStatus(projectToEdit.project_id, formData.status);
                }
                toast.success("Project updated successfully!", { id: tid });
            } else {
                await projectService.createProject(payload);
                toast.success("Project launched successfully!", { id: tid });
            }
            onSuccess();
        } catch (error) {
            toast.error(error.response?.data?.message || "Validation Error.", { id: tid });
        } finally {
            setLoading(false);
        }
    };

    return (
        <BaseModal isOpen={isOpen} onClose={onClose} title={projectToEdit ? 'Edit Project' : 'Initiate Project'}>
            <form id="project-form" onSubmit={handleSubmit} className="space-y-5 mt-2">
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-1 md:col-span-2">
                        <label className="text-[9px] font-black uppercase tracking-[0.2em] text-[#005587] ml-2 block">Project Title</label>
                        <input 
                            required type="text" value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})}
                            className="w-full bg-slate-50 border border-slate-100 focus:border-[#005587] rounded-2xl px-5 py-3.5 text-xs font-bold outline-none transition-all"
                        />
                    </div>
                    <div className="space-y-1">
                        <label className="text-[9px] font-black uppercase tracking-[0.2em] text-[#005587] ml-2 block">Status</label>
                        {/* 🌟 تم تعديل الحالات هنا */}
                        <select 
                            value={formData.status} onChange={(e) => setFormData({...formData, status: e.target.value})}
                            className="w-full bg-slate-50 border border-slate-100 focus:border-[#005587] rounded-2xl px-5 py-3.5 text-xs font-bold outline-none cursor-pointer transition-all"
                        >
                            <option value="Open">Open</option>
                            <option value="Ongoing">Ongoing</option>
                            <option value="Completed">Completed</option>
                            <option value="Cancelled">Cancelled</option>
                        </select>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                        <label className="text-[9px] font-black uppercase tracking-[0.2em] text-[#005587] ml-2 block">Start Date</label>
                        <input 
                            required type="date" value={formData.start_date} onChange={(e) => setFormData({...formData, start_date: e.target.value})}
                            className="w-full bg-slate-50 border border-slate-100 focus:border-[#005587] rounded-2xl px-5 py-3.5 text-xs font-bold text-slate-600 outline-none transition-all"
                        />
                    </div>
                    <div className="space-y-1">
                        <label className="text-[9px] font-black uppercase tracking-[0.2em] text-[#005587] ml-2 block">End Date</label>
                        <input 
                            required type="date" value={formData.end_date} onChange={(e) => setFormData({...formData, end_date: e.target.value})}
                            className="w-full bg-slate-50 border border-slate-100 focus:border-[#005587] rounded-2xl px-5 py-3.5 text-xs font-bold text-slate-600 outline-none transition-all"
                        />
                    </div>
                </div>

                <div className="space-y-1">
                    <label className="text-[9px] font-black uppercase tracking-[0.2em] text-[#005587] ml-2 block">Description</label>
                    <textarea 
                        required rows="3" value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})}
                        className="w-full bg-slate-50 border border-slate-100 focus:border-[#005587] rounded-2xl px-5 py-3.5 text-xs font-bold outline-none transition-all resize-none"
                    ></textarea>
                </div>

                <div className="space-y-3">
                    <div className="flex justify-between items-center">
                        <label className="text-[9px] font-black uppercase tracking-[0.2em] text-[#005587] ml-2 block">Required Roles</label>
                        <button type="button" onClick={handleAddRole} className="flex items-center gap-1 text-[9px] font-black uppercase tracking-widest text-[#005587] bg-blue-50 px-3 py-1.5 rounded-xl hover:bg-[#005587] hover:text-white transition-all">
                            <Plus size={12} /> Add
                        </button>
                    </div>

                    {formData.required_roles.map((role, index) => (
                        <div key={index} className="flex gap-2 items-center">
                            <input 
                                type="text" value={role.role_name} onChange={(e) => handleRoleChange(index, 'role_name', e.target.value)}
                                className="flex-1 bg-slate-50 border border-slate-100 focus:border-[#005587] rounded-xl px-4 py-2.5 text-xs font-bold outline-none" placeholder="Role Name..."
                            />
                            <input 
                                type="number" min="1" value={role.required_count} onChange={(e) => handleRoleChange(index, 'required_count', e.target.value)}
                                className="w-20 bg-slate-50 border border-slate-100 focus:border-[#005587] rounded-xl px-4 py-2.5 text-xs font-bold outline-none text-center" placeholder="Qty"
                            />
                            <button type="button" onClick={() => handleRemoveRole(index)} className="p-2.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-all">
                                <Trash2 size={16} />
                            </button>
                        </div>
                    ))}
                </div>

                <div className="pt-4 flex gap-3">
                    <button type="button" onClick={onClose} disabled={loading} className="flex-1 py-4 text-[9px] font-black uppercase tracking-widest text-slate-400 border border-slate-100 rounded-2xl hover:bg-slate-50 transition-colors">
                        Abort
                    </button>
                    <button type="submit" disabled={loading} className="flex-[2] flex justify-center items-center gap-2 bg-[#005587] text-white py-4 text-[9px] font-black uppercase tracking-widest rounded-2xl shadow-xl shadow-blue-900/20 active:scale-95 transition-all disabled:opacity-50">
                        {loading ? <Loader2 className="animate-spin" size={16}/> : <Save size={16} />}
                        {projectToEdit ? "Save Changes" : "Launch Project"}
                    </button>
                </div>
            </form>
        </BaseModal>
    );
};

export default ProjectFormModal;