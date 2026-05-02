import React, { useState, useEffect } from 'react';
import { X, Save, Loader2, Plus, Trash2 } from 'lucide-react';
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
        required_roles: [
            { role_name: '', required_count: 1 } 
        ]
    });

    useEffect(() => {
        if (projectToEdit) {
            setFormData({
                title: projectToEdit.title || '',
                description: projectToEdit.description || '',
                status: projectToEdit.status || 'Open',
                start_date: projectToEdit.start_date || '',
                end_date: projectToEdit.end_date || '',
                // إذا عم نعدل ومافي أدوار من الباك إند، بنخليها مصفوفة فاضية عشان ما تطلعله حقول فاضية غصب
                required_roles: projectToEdit.required_roles?.length ? projectToEdit.required_roles : []
            });
        } else {
            setFormData({ 
                title: '', 
                description: '',
                status: 'Open', 
                start_date: '',
                end_date: '',
                required_roles: [{ role_name: '', required_count: 1 }]
            });
        }
    }, [projectToEdit, isOpen]);

    const handleAddRole = () => {
        setFormData({
            ...formData,
            required_roles: [...formData.required_roles, { role_name: '', required_count: 1 }]
        });
    };

    const handleRemoveRole = (index) => {
        const newRoles = formData.required_roles.filter((_, i) => i !== index);
        setFormData({ ...formData, required_roles: newRoles });
    };

    const handleRoleChange = (index, field, value) => {
        const newRoles = [...formData.required_roles];
        newRoles[index][field] = value;
        setFormData({ ...formData, required_roles: newRoles });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        const chapterId = localStorage.getItem('chapter_id');
        if (!chapterId) {
            toast.error("Chapter ID not found in local storage!");
            return;
        }

        const cleanRoles = formData.required_roles
            .filter(role => role.role_name && role.role_name.trim() !== '')
            .map(role => ({
                role_name: role.role_name.trim(),
                required_count: parseInt(role.required_count) || 1
            }));

        // 🌟 منع الحفظ بدون أدوار "فقط" في حالة الإنشاء الجديد
        if (!projectToEdit && cleanRoles.length === 0) {
            toast.error("Please add at least one valid required role for the new project.");
            return;
        }

        if (!formData.start_date || !formData.end_date) {
            toast.error("Please select both start and end dates.");
            return;
        }

        const payload = {
            title: formData.title,
            description: formData.description,
            status: formData.status,
            start_date: formData.start_date,
            end_date: formData.end_date,
            chapter_id: parseInt(chapterId)
        };

        // نرسل الأدوار فقط إذا كان هناك أدوار جديدة أو ننشئ مشروع جديد
        if (cleanRoles.length > 0 || !projectToEdit) {
            payload.required_roles = cleanRoles;
        }

        setLoading(true);
        const tid = toast.loading(projectToEdit ? "Updating Project..." : "Creating Project...");

        try {
            if (projectToEdit) {
                await projectService.updateProject(projectToEdit.project_id, payload);
                toast.success("Project updated!", { id: tid });
            } else {
                await projectService.createProject(payload);
                toast.success("Project launched successfully!", { id: tid });
            }
            onSuccess();
        } catch (error) {
            const errorMessage = error.response?.data?.message || "Validation Error: Please check all fields.";
            toast.error(errorMessage, { id: tid });
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
            <div className="bg-white w-full max-w-2xl rounded-[40px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 max-h-[90vh] flex flex-col">
                
                <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-slate-50/50 shrink-0">
                    <div>
                        <h2 className="text-2xl font-[900] text-[#005587] italic uppercase tracking-tight">
                            {projectToEdit ? 'Edit Project' : 'Initiate Project'}
                        </h2>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.4em] mt-2 ml-1">Declare Project Roles & Timeline</p>
                    </div>
                    <button onClick={onClose} className="p-3 hover:bg-white rounded-2xl text-slate-400 transition-all shadow-sm">
                        <X size={20} />
                    </button>
                </div>

                <div className="overflow-y-auto custom-scrollbar p-8">
                    <form id="project-form" onSubmit={handleSubmit} className="space-y-6">
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="space-y-2 md:col-span-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 italic">Project Title</label>
                                <input 
                                    required
                                    type="text"
                                    value={formData.title}
                                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                                    className="w-full bg-slate-50 border-none focus:ring-2 focus:ring-blue-100 rounded-2xl px-5 py-4 text-sm font-bold text-slate-700 outline-none transition-all"
                                />
                            </div>
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
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 italic">Start Date</label>
                                <input 
                                    required
                                    type="date"
                                    value={formData.start_date}
                                    onChange={(e) => setFormData({...formData, start_date: e.target.value})}
                                    className="w-full bg-slate-50 border-none focus:ring-2 focus:ring-blue-100 rounded-2xl px-5 py-4 text-sm font-bold text-slate-700 outline-none transition-all"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 italic">End Date</label>
                                <input 
                                    required
                                    type="date"
                                    value={formData.end_date}
                                    onChange={(e) => setFormData({...formData, end_date: e.target.value})}
                                    className="w-full bg-slate-50 border-none focus:ring-2 focus:ring-blue-100 rounded-2xl px-5 py-4 text-sm font-bold text-slate-700 outline-none transition-all"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 italic">Description</label>
                            <textarea 
                                required
                                rows="3"
                                value={formData.description}
                                onChange={(e) => setFormData({...formData, description: e.target.value})}
                                className="w-full bg-slate-50 border-none focus:ring-2 focus:ring-blue-100 rounded-2xl px-5 py-4 text-sm font-bold text-slate-700 outline-none transition-all resize-none"
                            ></textarea>
                        </div>

                        <hr className="border-slate-50" />

                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <label className="text-[10px] font-black text-[#005587] uppercase tracking-widest ml-1 italic">Open Positions (Roles needed)</label>
                                <button 
                                    type="button" 
                                    onClick={handleAddRole}
                                    className="flex items-center gap-1 text-[9px] font-black uppercase tracking-widest text-[#005587] bg-blue-50 px-3 py-1.5 rounded-xl hover:bg-[#005587] hover:text-white transition-all"
                                >
                                    <Plus size={12} /> Add Role
                                </button>
                            </div>

                            <div className="space-y-3">
                                {formData.required_roles.map((role, index) => (
                                    <div key={index} className="flex gap-3 items-center bg-slate-50 p-3 rounded-2xl">
                                        <div className="flex-1">
                                            {/* 🌟 شلنا الـ required من هون لحتى ما يزعجك بالتعديل */}
                                            <input 
                                                type="text"
                                                value={role.role_name}
                                                onChange={(e) => handleRoleChange(index, 'role_name', e.target.value)}
                                                className="w-full bg-white border border-slate-100 focus:ring-2 focus:ring-blue-100 rounded-xl px-4 py-2 text-xs font-bold text-slate-700 outline-none"
                                                placeholder="e.g., Project Leader, UI Designer..."
                                            />
                                        </div>
                                        <div className="w-24">
                                            {/* 🌟 وشلناه من هون كمان */}
                                            <input 
                                                type="number"
                                                min="1"
                                                value={role.required_count}
                                                onChange={(e) => handleRoleChange(index, 'required_count', e.target.value)}
                                                className="w-full bg-white border border-slate-100 focus:ring-2 focus:ring-blue-100 rounded-xl px-4 py-2 text-xs font-bold text-slate-700 outline-none text-center"
                                                placeholder="Qty"
                                            />
                                        </div>
                                        <button 
                                            type="button"
                                            onClick={() => handleRemoveRole(index)}
                                            className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-all"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>

                    </form>
                </div>

                <div className="p-6 border-t border-slate-50 bg-slate-50/50 shrink-0">
                    <button 
                        form="project-form"
                        type="submit"
                        disabled={loading}
                        className="w-full py-5 bg-[#005587] text-white rounded-[22px] font-[900] text-[12px] uppercase tracking-[0.2em] shadow-xl shadow-blue-100 flex items-center justify-center gap-3 hover:-translate-y-1 active:scale-95 transition-all disabled:opacity-50"
                    >
                        {loading ? <Loader2 className="animate-spin" size={18}/> : <Save size={18} />}
                        {projectToEdit ? 'Save Changes' : 'Launch Project'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ProjectFormModal;