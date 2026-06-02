import React, { useState, useEffect, useRef } from 'react';
import BaseModal from '@/components/ui/BaseModal'; 
import { Save, Loader2, Trash2, Target, Star, ChevronDown } from 'lucide-react';
import { projectService } from '../../../services/projectService';
import toast from 'react-hot-toast';

// 🌟 1. CustomDropdown تم تنظيفه بالكامل ليكون فقط للـ UI
const CustomDropdown = ({ options, value, onChange, placeholder, className, disabled }) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);
    
    // إغلاق الدروب داون عند الضغط بالخارج
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const selectedOption = options.find(opt => opt.value === value);
    
    return (
        <div className={`relative ${isOpen ? 'z-[60]' : 'z-10'} ${className}`} ref={dropdownRef}>
            <div 
                onClick={() => !disabled && setIsOpen(!isOpen)}
                className={`flex items-center justify-between w-full border rounded-xl px-3 py-2.5 text-xs font-bold outline-none transition-all h-full ${disabled ? 'bg-slate-100/50 border-slate-100 text-slate-400 cursor-not-allowed' : 'bg-slate-50 border-slate-100 hover:border-[#005587]/30 focus-within:border-[#005587] cursor-pointer'}`}
            >
                <span className={selectedOption ? 'text-slate-800 line-clamp-1' : 'text-slate-400 line-clamp-1'}>
                    {selectedOption ? selectedOption.label : placeholder}
                </span>
                {!disabled && <ChevronDown size={14} className={`text-slate-400 shrink-0 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />}
            </div>
            {isOpen && !disabled && (
                <div className="absolute top-[calc(100%+4px)] left-0 w-full bg-white border border-slate-100 rounded-xl shadow-xl max-h-40 overflow-y-auto custom-scrollbar flex flex-col py-1 animate-in fade-in slide-in-from-top-2 duration-200">
                    {options.map((opt, idx) => (
                        <div key={idx} onClick={() => { onChange(opt.value); setIsOpen(false); }} className={`px-3 py-2.5 text-xs font-bold cursor-pointer transition-colors ${value === opt.value ? 'bg-blue-50 text-[#005587]' : 'text-slate-600 hover:bg-slate-50 hover:text-[#005587]'}`}>
                            {opt.label}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

// 🌟 2. ProjectFormModal اللي بيحتوي على داتا المهارات واللوجيك
const ProjectFormModal = ({ isOpen, onClose, projectToEdit, onSuccess }) => {
    const [loading, setLoading] = useState(false);
    const [availableSkills, setAvailableSkills] = useState([]);
    const [formData, setFormData] = useState({ 
        title: '', description: '', status: 'Open', start_date: '', end_date: '',
        required_roles: [{ role_name: 'Project Leader', required_count: 1, required_skills: [] }]
    });

    useEffect(() => {
        const fetchSkills = async () => {
            try {
                const res = await projectService.getSkills();
                const skills = res.data?.data || res.data || [];
                
                if (skills.length === 0) {
                    console.warn("Using Mock Skills Data...");
                    setAvailableSkills([
                        { id: 1, name: 'React.js Development' },
                        { id: 2, name: 'UI/UX Design (Figma)' },
                        { id: 3, name: 'Laravel Backend' },
                        { id: 4, name: 'Project Management' },
                        { id: 5, name: 'Public Speaking' },
                        { id: 6, name: 'Technical Writing' }
                    ]);
                } else {
                    setAvailableSkills(skills);
                }
            } catch (error) { 
                console.error("Skills load error, using fallbacks:", error); 
                setAvailableSkills([
                    { id: 1, name: 'React.js (Fallback)' },
                    { id: 2, name: 'UI/UX (Fallback)' },
                    { id: 3, name: 'Backend (Fallback)' }
                ]);
            }
        };
        if (isOpen) fetchSkills();
    }, [isOpen]);

    useEffect(() => {
        if (projectToEdit && isOpen) {
            const formatDate = (dateStr) => dateStr ? dateStr.substring(0, 10) : '';
            setFormData({
                title: projectToEdit.title || '',
                description: projectToEdit.description || '',
                status: projectToEdit.status || 'Open',
                start_date: formatDate(projectToEdit.start_date),
                end_date: formatDate(projectToEdit.end_date), 
                required_roles: projectToEdit.required_roles?.map(r => ({
                    role_name: r.role_name,
                    required_count: r.required_count,
                    required_skills: r.required_skills || []
                })) || [{ role_name: 'Project Leader', required_count: 1, required_skills: [] }]
            });
        } else {
            setFormData({ 
                title: '', description: '', status: 'Open', start_date: '', end_date: '',
                required_roles: [{ role_name: 'Project Leader', required_count: 1, required_skills: [] }]
            });
        }
    }, [projectToEdit, isOpen]);

    const handleAddRole = () => setFormData({ ...formData, required_roles: [...formData.required_roles, { role_name: '', required_count: 1, required_skills: [] }] });
    const handleRemoveRole = (index) => setFormData({ ...formData, required_roles: formData.required_roles.filter((_, i) => i !== index) });
    const handleRoleChange = (index, field, value) => {
        const newRoles = [...formData.required_roles];
        newRoles[index][field] = value;
        setFormData({ ...formData, required_roles: newRoles });
    };
    const handleAddSkill = (roleIndex) => {
        const newRoles = [...formData.required_roles];
        newRoles[roleIndex].required_skills.push({ skill_id: '', min_level: 3, weight: 0.5 });
        setFormData({ ...formData, required_roles: newRoles });
    };
    const handleSkillChange = (roleIndex, skillIndex, field, value) => {
        const newRoles = [...formData.required_roles];
        newRoles[roleIndex].required_skills[skillIndex][field] = (field === 'weight') ? parseFloat(value) : parseInt(value);
        setFormData({ ...formData, required_roles: newRoles });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const chapterId = localStorage.getItem('chapter_id');
        const cleanRoles = formData.required_roles.filter(role => role.role_name?.trim()).map(role => ({
            role_name: role.role_name.trim(),
            required_count: parseInt(role.required_count) || 1,
            required_skills: role.required_skills.filter(s => s.skill_id).map(s => ({
                skill_id: parseInt(s.skill_id),
                min_level: parseInt(s.min_level) || 3,
                weight: parseFloat(s.weight) || 0.5
            }))
        }));

        const payload = {
            title: formData.title.trim(), description: formData.description.trim(),
            start_date: formData.start_date, end_date: formData.end_date,
            chapter_id: parseInt(chapterId), required_roles: cleanRoles
        };
        if (projectToEdit) payload.status = formData.status;

        setLoading(true);
        const tid = toast.loading(projectToEdit ? "Updating..." : "Launching...");
        try {
            if (projectToEdit) {
                await projectService.updateProject(projectToEdit.project_id, payload);
            } else {
                await projectService.createProject(payload);
            }
            toast.success("Success!", { id: tid });
            onSuccess();
        } catch (error) { toast.error("Error saving project.",error, { id: tid }); }
        finally { setLoading(false); }
    };

    return (
        <BaseModal isOpen={isOpen} onClose={onClose} title={projectToEdit ? 'Edit Project' : 'Initiate Project'}>
            <form onSubmit={handleSubmit} className="space-y-5 mt-2">
                
                {/* العنوان والحالة */}
                <div className={`grid grid-cols-1 ${projectToEdit ? 'md:grid-cols-3' : 'md:grid-cols-2'} gap-4`}>
                    <div className="space-y-1 md:col-span-2">
                        <label className="text-[9px] font-black uppercase tracking-[0.2em] text-[#005587] ml-2 block">Project Title</label>
                        <input required type="text" value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} className="w-full h-11 bg-slate-50 border border-slate-100 rounded-xl px-4 text-xs font-bold outline-none transition-all" />
                    </div>
                    {projectToEdit && (
                        <div className="space-y-1">
                            <label className="text-[9px] font-black uppercase tracking-[0.2em] text-[#005587] ml-2 block">Status</label>
                            <CustomDropdown 
                                options={[{value:'Open', label:'Open'}, {value:'Ongoing', label:'Ongoing'}, {value:'Completed', label:'Completed'}, {value:'Cancelled', label:'Cancelled'}]} 
                                value={formData.status} 
                                onChange={(val) => setFormData({...formData, status: val})} 
                                className="h-11"
                            />
                        </div>
                    )}
                </div>

                {/* التواريخ */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                        <label className="text-[9px] font-black uppercase tracking-[0.2em] text-[#005587] ml-2 block">Start Date</label>
                        <input required type="date" value={formData.start_date} onChange={(e) => setFormData({...formData, start_date: e.target.value})} className="w-full h-11 bg-slate-50 border border-slate-100 rounded-xl px-4 text-xs font-bold text-slate-600 outline-none transition-all" />
                    </div>
                    <div className="space-y-1">
                        <label className="text-[9px] font-black uppercase tracking-[0.2em] text-[#005587] ml-2 block">End Date</label>
                        <input required type="date" value={formData.end_date} onChange={(e) => setFormData({...formData, end_date: e.target.value})} className="w-full h-11 bg-slate-50 border border-slate-100 rounded-xl px-4 text-xs font-bold text-slate-600 outline-none transition-all" />
                    </div>
                </div>

                <div className="space-y-1">
                    <label className="text-[9px] font-black uppercase tracking-[0.2em] text-[#005587] ml-2 block">Description</label>
                    <textarea required rows="3" value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-xs font-bold outline-none transition-all resize-none"></textarea>
                </div>

                {/* Roles & Skills */}
                <div className="space-y-4 pt-4 border-t border-slate-100">
                    <div className="flex justify-between items-center">
                        <label className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-800 ml-2 block">Roles & Requirements</label>
                        <button type="button" onClick={handleAddRole} className="text-[9px] font-black uppercase text-white bg-[#005587] px-4 py-2 rounded-xl shadow-md hover:bg-slate-900 transition-all">+ Add Role</button>
                    </div>

                    <div className="space-y-6">
                        {formData.required_roles.map((role, roleIndex) => {
                            const isLeader = role.role_name === 'Project Leader';
                            return (
                                <div key={roleIndex} className="bg-slate-50/50 border border-slate-200 rounded-[2rem] p-5">
                                    <div className="flex flex-wrap sm:flex-nowrap gap-3 items-center mb-4">
                                        <input type="text" value={role.role_name} disabled={isLeader} onChange={(e) => handleRoleChange(roleIndex, 'role_name', e.target.value)} className={`flex-[3] min-w-[150px] h-11 border border-slate-200 rounded-xl px-4 text-sm font-black outline-none ${isLeader ? 'bg-blue-50 text-[#005587] border-blue-200 cursor-not-allowed' : 'bg-white focus:border-[#005587]'}`} placeholder="Role Name..." />
                                        <div className="flex items-center gap-2 bg-white px-3 h-11 rounded-xl border border-slate-200 shrink-0">
                                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Qty:</span>
                                            <input type="number" min="1" value={role.required_count} disabled={isLeader} onChange={(e) => handleRoleChange(roleIndex, 'required_count', e.target.value)} className="w-10 h-full text-xs font-black outline-none text-center bg-transparent" />
                                        </div>
                                        {!isLeader && <button type="button" onClick={() => handleRemoveRole(roleIndex)} className="w-11 h-11 flex items-center justify-center text-slate-400 bg-white hover:text-rose-500 rounded-xl transition-all border border-slate-200"><Trash2 size={16}/></button>}
                                    </div>
                                    {!isLeader && (
                                        <div className="pl-4 ml-2 border-l-2 border-blue-100 space-y-4 mt-6">
                                            <div className="flex justify-between items-center"><p className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1"><Target size={12}/> Skills & Importance</p><button type="button" onClick={() => handleAddSkill(roleIndex)} className="text-[9px] font-black text-[#005587] hover:bg-blue-100 px-3 py-1.5 rounded-lg">+ Add Skill</button></div>
                                            {role.required_skills.map((skill, skillIndex) => (
                                                <div key={skillIndex} className="flex flex-col gap-3 p-4 bg-white border border-slate-200 rounded-[1.5rem]">
                                                    <div className="flex flex-wrap sm:flex-nowrap gap-2 items-center">
                                                        <CustomDropdown options={availableSkills.map(s=>({value:s.id, label:s.name}))} value={skill.skill_id} onChange={(val)=>handleSkillChange(roleIndex, skillIndex, 'skill_id', val)} placeholder="Select Skill..." className="flex-[2] min-w-[120px] h-10" />
                                                        <CustomDropdown options={[{value:1,label:'Lvl 1'},{value:2,label:'Lvl 2'},{value:3,label:'Lvl 3'},{value:4,label:'Lvl 4'},{value:5,label:'Lvl 5'}]} value={skill.min_level} onChange={(val)=>handleSkillChange(roleIndex, skillIndex, 'min_level', val)} placeholder="Level" className="flex-[1] min-w-[100px] h-10" />
                                                        <button type="button" onClick={()=>setFormData({...formData, required_roles: formData.required_roles.map((r, ri) => ri === roleIndex ? {...r, required_skills: r.required_skills.filter((_, si) => si !== skillIndex)} : r)})} className="w-10 h-10 flex items-center justify-center text-slate-400 hover:text-rose-500 border border-slate-100 rounded-lg"><Trash2 size={14}/></button>
                                                    </div>
                                                    <div className="flex items-center gap-4 px-1 mt-2">
                                                        <Star size={14} className="text-slate-400 shrink-0" />
                                                        <div className="flex-1 flex flex-col gap-1.5">
                                                            <div className="flex justify-between text-[8px] font-black uppercase text-slate-300"><span>Bonus</span><span>Crucial</span></div>
                                                            <input type="range" min="0.1" max="1.0" step="0.1" value={skill.weight} onChange={(e)=>handleSkillChange(roleIndex, skillIndex, 'weight', e.target.value)} className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none accent-[#005587]" />
                                                        </div>
                                                        <div className="w-24 text-right">
                                                            <span className={`text-[9px] font-black uppercase ${skill.weight >= 0.8 ? 'text-rose-500' : skill.weight >= 0.5 ? 'text-amber-500' : 'text-slate-400'}`}>
                                                                {skill.weight >= 0.8 ? 'Must Have' : skill.weight >= 0.5 ? 'Important' : 'Bonus'}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>

                <div className="pt-6 flex gap-3">
                    <button type="button" onClick={onClose} disabled={loading} className="flex-1 py-4 text-[9px] font-black uppercase text-slate-400 border border-slate-100 rounded-2xl hover:bg-slate-50 transition-colors">Abort</button>
                    <button type="submit" disabled={loading} className="flex-[2] flex justify-center items-center gap-2 bg-[#005587] text-white py-4 text-[9px] font-black uppercase rounded-2xl shadow-xl active:scale-95 transition-all">
                        {loading ? <Loader2 className="animate-spin" size={16}/> : <Save size={16} />} {projectToEdit ? "Save Changes" : "Launch Project"}
                    </button>
                </div>
            </form>
        </BaseModal>
    );
};

export default ProjectFormModal;