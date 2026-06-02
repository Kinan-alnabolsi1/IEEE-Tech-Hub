import React, { useState, useEffect } from 'react';
import { projectService } from '../../services/projectService';
import { volunteerService } from '../../services/volunteerService';
import { Plus, Clock, CheckCircle2, AlertCircle, Trash2, Edit2, Calendar, User, Loader2, Star, MessageSquare, Award, ChevronDown } from 'lucide-react';
import BaseModal from '../../components/ui/BaseModal';
import Loader from '../../components/ui/Loader';
import toast from 'react-hot-toast';

// 🌟 المكون للدروب داون
const CustomDropdown = ({ value, onChange, options, label }) => {
    const [isOpen, setIsOpen] = useState(false);
    const selectedLabel = options.find(opt => opt.value === value)?.label || value;

    return (
        <div className="space-y-1 relative">
            <label className="text-[9px] font-black uppercase text-[#005587] ml-2 block tracking-widest">{label}</label>
            <div
                onClick={() => setIsOpen(!isOpen)}
                className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-xs font-bold outline-none cursor-pointer flex justify-between items-center"
            >
                <span className="text-slate-800">{selectedLabel}</span>
                <ChevronDown size={14} className={`text-slate-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </div>
            {isOpen && (
                <div className="absolute z-50 w-full mt-1 bg-white border border-slate-200 rounded-xl shadow-lg overflow-hidden">
                    {options.map(opt => (
                        <div
                            key={opt.value}
                            onClick={() => { onChange(opt.value); setIsOpen(false); }}
                            className="px-4 py-3 text-xs font-bold text-slate-700 hover:bg-blue-50 hover:text-[#00629B] cursor-pointer transition-colors"
                        >
                            {opt.label}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

const TasksBoard = () => {
    const [tasks, setTasks] = useState([]);
    const [teamMembers, setTeamMembers] = useState([]);
    const [loading, setLoading] = useState(true);
    
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [taskToEdit, setTaskToEdit] = useState(null);
    const [submitting, setSubmitting] = useState(false);

    const [isEvalModalOpen, setIsEvalModalOpen] = useState(false);
    const [evalTask, setEvalTask] = useState(null);
    const [evaluations, setEvaluations] = useState({});
    const [evalSubmitting, setEvalSubmitting] = useState(false);
    const [deleteModal, setDeleteModal] = useState({ isOpen: false, task: null });
    const [deleteSubmitting, setDeleteSubmitting] = useState(false);

    const [formData, setFormData] = useState({
        title: '', description: '', priority: 'Medium', status: 'To Do', due_date: '', assigned_users: []
    });

    const getProjectRole = (member) => (
        member?.pivot?.role || member?.pivot?.role_name || member?.role_in_project || 'Project Member'
    );

    const getTaskAssignees = (task) => task?.assignees || task?.assigned_users || task?.assignedUsers || [];
    const getMemberId = (member) => member?.user_id || member?.id || member?.pivot?.user_id;
    const getMemberName = (member) => member?.full_name || member?.username || member?.name || 'Volunteer';

    const normalizeTaskStatus = (status) => {
        const value = String(status || '').toLowerCase().replace(/\s+/g, ' ').trim();
        if (value === 'pending' || value === 'todo' || value === 'to do') return 'To Do';
        if (value === 'inprogress' || value === 'in progress') return 'In Progress';
        if (value === 'completed' || value === 'complete' || value === 'done') return 'Completed';
        return 'To Do';
    };

    const getAssignedProjectRole = (assignedUser) => {
        const assignedId = getMemberId(assignedUser);
        const member = teamMembers.find(m => String(getMemberId(m)) === String(assignedId));
        return member ? getProjectRole(member) : 'Project Member';
    };

    const fetchData = async () => {
        try {
            setLoading(true);
            let pId = localStorage.getItem('managed_project_id');

            if (!pId || pId === 'undefined' || pId === 'null') {
                const profileRes = await volunteerService.getProfile();
                const userData = profileRes.data?.data || profileRes.data;
                const leaderProject = userData?.projects?.find(p => p.role_in_project?.toLowerCase().includes('leader'));
                if (leaderProject) {
                    pId = String(leaderProject.project_id);
                    localStorage.setItem('managed_project_id', pId);
                }
            }

            if (!pId) { setLoading(false); return; }

            const [tasksRes, projectRes] = await Promise.all([
                projectService.getProjectTasks(pId),
                projectService.getProjectDetails(pId)
            ]);
            setTasks(tasksRes.data?.data || tasksRes.data || []);

            const members = projectRes.data?.data?.members || projectRes.data?.members || [];
            
            // 🌟 الخوارزمية الصارمة الجديدة: الأولوية القصوى لجدول الـ Pivot
            const approvedVolunteers = members.filter(m => {
                // سحب حالة الانضمام للمشروع حصراً وتجنب حالة الحساب العام
                const pivotStat = m.pivot?.status || m.pivot?.join_status || m.pivot?.request_status;
                const stat = pivotStat || m.status || ''; 
                
                const role = m.role || '';

                const isApproved = stat.toLowerCase() === 'approved' || stat.toLowerCase() === 'active' || stat.toLowerCase() === 'accepted';
                const isVolunteer = role.trim().toLowerCase() === "volunteer";
                
                return isApproved && isVolunteer;
            });
            
            setTeamMembers(approvedVolunteers);

        } catch (error) {
            console.error("Board Data Error:", error);
            if (error.response?.status !== 404) toast.error("Error loading board data.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchData(); }, []);

    const openModal = (task = null) => {
        if (task) {
            setTaskToEdit(task);
            const assignedIds = getTaskAssignees(task).map(getMemberId).filter(Boolean);
            setFormData({
                title: task.title, 
                description: task.description || '',
                priority: task.priority || 'Medium', 
                status: normalizeTaskStatus(task.status),
                due_date: task.due_date ? task.due_date.substring(0, 10) : '', 
                assigned_users: assignedIds
            });
        } else {
            setTaskToEdit(null);
            setFormData({ title: '', description: '', priority: 'Medium', status: 'To Do', due_date: '', assigned_users: [] });
        }
        setIsModalOpen(true);
    };

    const handleAssignUser = (userId) => {
        setFormData(prev => ({
            ...prev,
            assigned_users: prev.assigned_users.some(id => String(id) === String(userId)) ? [] : [userId]
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const pId = localStorage.getItem('managed_project_id');
        if (!pId) return toast.error("Project context lost.");
        if (!taskToEdit && formData.assigned_users.length === 0) return toast.error("Please assign at least one member.");

        setSubmitting(true);
        const tid = toast.loading("Processing Task...");
        try {
            const payload = { 
                ...formData, 
                description: formData.description?.trim() || null,
                status: normalizeTaskStatus(formData.status),
                project_id: parseInt(pId, 10)
            };
            if (taskToEdit) {
                await projectService.updateTask(taskToEdit.task_id || taskToEdit.id, payload);
                toast.success("Task updated!", { id: tid });
            } else {
                await projectService.createTask(payload);
                toast.success("Task assigned!", { id: tid });
            }
            setIsModalOpen(false);
            fetchData();
        } catch (error) {
            console.error("Task Submit Error:", error.response?.data);
            let errorMessage = "Failed to save task.";
            if (error.response?.status === 422 && error.response?.data?.errors) {
                const errors = error.response.data.errors;
                const firstErrorKey = Object.keys(errors)[0];
                errorMessage = errors[firstErrorKey][0]; 
            } else if (error.response?.data?.message) {
                errorMessage = error.response.data.message;
            }
            toast.error(errorMessage, { id: tid });
        } finally {
            setSubmitting(false);
        }
    };

    const openDeleteModal = (task) => {
        setDeleteModal({ isOpen: true, task });
    };

    const closeDeleteModal = () => {
        if (!deleteSubmitting) setDeleteModal({ isOpen: false, task: null });
    };

    const handleDelete = async () => {
        const taskId = deleteModal.task?.task_id || deleteModal.task?.id;
        if (!taskId) return;

        setDeleteSubmitting(true);
        try {
            await projectService.deleteTask(taskId);
            toast.success("Task deleted.");
            setTasks(prev => prev.filter(t => (t.task_id || t.id) !== taskId));
            setDeleteModal({ isOpen: false, task: null });
        } catch (error) { 
            toast.error("Delete failed.",error); 
        } finally {
            setDeleteSubmitting(false);
        }
    };

    const openEvalModal = (task) => {
        setEvalTask(task);
        const assignedIds = getTaskAssignees(task).map(getMemberId).filter(Boolean);
        
        const initialEvals = {};
        teamMembers.forEach(m => {
            const uid = m.user_id || m.id;
            initialEvals[uid] = { rating: 5, feedback: '', isSelected: assignedIds.some(id => String(id) === String(uid)) };
        });
        setEvaluations(initialEvals);
        setIsEvalModalOpen(true);
    };

    const toggleMemberInEval = (userId) => {
        setEvaluations(prev => ({ ...prev, [userId]: { ...prev[userId], isSelected: !prev[userId].isSelected } }));
    };

    const handleRatingChange = (userId, rating) => {
        setEvaluations(prev => ({ ...prev, [userId]: { ...prev[userId], rating } }));
    };

    const handleFeedbackChange = (userId, feedback) => {
        setEvaluations(prev => ({ ...prev, [userId]: { ...prev[userId], feedback } }));
    };

    const submitEvaluations = async () => {
        const selectedMembers = Object.keys(evaluations).filter(uid => evaluations[uid].isSelected);
        if (selectedMembers.length === 0) return toast.error("Please select at least one member to evaluate.");
        setEvalSubmitting(true);
        const taskId = evalTask.task_id || evalTask.id;
        let successCount = 0;
        try {
            for (const userId of selectedMembers) {
                const data = { rating: evaluations[userId].rating, leader_feedback: evaluations[userId].feedback };
                await projectService.evaluateMember(taskId, userId, data);
                successCount++;
            }
            toast.success(`Successfully evaluated ${successCount} members!`);
            setIsEvalModalOpen(false);
            fetchData(); 
        } catch (error) {
            console.error("Evaluation error:", error);
            toast.error("Evaluation failed (Server Error 500).");
        } finally {
            setEvalSubmitting(false);
        }
    };

    const columns = [
        { id: 'To Do', title: 'To Do', icon: <Clock size={16} className="text-amber-500"/> },
        { id: 'In Progress', title: 'In Progress', icon: <Loader2 size={16} className="text-blue-500 animate-spin-slow"/> },
        { id: 'Completed', title: 'Completed', icon: <CheckCircle2 size={16} className="text-emerald-500"/> }
    ];

    if (loading) return <Loader message="Accessing Tasks Records..." />;

    return (
        <div className="p-4 md:p-0 space-y-8 animate-in fade-in duration-700 h-full flex flex-col">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
                <div>
                    <h1 className="text-3xl font-black text-[#00629B] uppercase italic tracking-tight">Tasks Board</h1>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.4em] mt-2">Team Operations Center</p>
                </div>
                <button onClick={() => openModal()} className="px-6 py-3.5 bg-[#00629B] text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg hover:bg-slate-900 transition-all flex items-center gap-2 active:scale-95">
                    <Plus size={14} /> Assign New Task
                </button>
            </div>

            <div className="flex-1 flex gap-6 overflow-x-auto pb-8 custom-scrollbar min-h-[500px]">
                {columns.map(col => {
                    const colTasks = tasks.filter(t => {
                        return normalizeTaskStatus(t.status) === col.id;
                    });

                    return (
                        <div key={col.id} className="flex-1 min-w-[320px] max-w-[400px] flex flex-col bg-slate-50/50 rounded-[2.5rem] border border-slate-100 p-2">
                            <div className="p-5 bg-white rounded-[2rem] shadow-sm flex justify-between items-center mb-4">
                                <div className="flex items-center gap-2.5">{col.icon} <h3 className="text-sm font-black text-slate-700 uppercase">{col.title}</h3></div>
                                <span className="bg-slate-100 text-slate-500 px-3 py-1 rounded-full text-[10px] font-black">{colTasks.length}</span>
                            </div>

                            <div className="max-h-[620px] overflow-y-auto space-y-4 px-2 pr-3 custom-scrollbar">
                                {colTasks.length > 0 ? colTasks.map(task => {
                                    const assignees = getTaskAssignees(task);

                                    return (
                                    <div key={task.task_id || task.id} className="bg-white p-5 rounded-[1.8rem] shadow-sm border border-slate-100 group hover:shadow-md transition-all animate-in fade-in slide-in-from-bottom-2 relative overflow-hidden">
                                        <div className="flex justify-between items-start mb-3">
                                            <span className={`px-3 py-1 rounded-lg text-[8px] font-black uppercase ${task.priority === 'High' ? 'bg-rose-50 text-rose-600' : 'bg-blue-50 text-blue-600'}`}>{task.priority}</span>
                                            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                {col.id === 'Completed' && (
                                                    <button onClick={() => openEvalModal(task)} className="p-1.5 bg-amber-50 text-amber-500 hover:bg-amber-100 rounded-lg mr-1 transition-colors"><Star size={12} fill="currentColor"/></button>
                                                )}
                                                <button onClick={() => openModal(task)} className="p-1.5 text-slate-400 hover:text-blue-600"><Edit2 size={12}/></button>
                                                <button onClick={() => openDeleteModal(task)} className="p-1.5 text-slate-400 hover:text-rose-600"><Trash2 size={12}/></button>
                                            </div>
                                        </div>
                                        <h4 className="text-sm font-bold text-slate-800 mb-2 leading-snug">{task.title}</h4>
                                        {task.description && (
                                            <p className="text-xs font-medium text-slate-500 leading-relaxed line-clamp-2 mb-4">
                                                {task.description}
                                            </p>
                                        )}
                                        <div className="border-t border-slate-50 pt-4 space-y-3">
                                            <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400">
                                                <Calendar size={12}/> {task.due_date?.substring(0, 10) || 'No deadline'}
                                            </div>
                                            <div className="space-y-2">
                                                <p className="flex items-center gap-1.5 text-[9px] font-black text-slate-400 uppercase tracking-widest">
                                                    <User size={11} /> Assigned To
                                                </p>
                                                {assignees.length > 0 ? assignees.map((user) => {
                                                    const userId = getMemberId(user);
                                                    const userName = getMemberName(user);

                                                    return (
                                                        <div key={userId} className="flex items-center gap-2 bg-slate-50 rounded-xl px-2.5 py-2 border border-slate-100 min-w-0">
                                                            <div className="w-7 h-7 rounded-full bg-blue-100 text-[#00629B] flex items-center justify-center text-[9px] font-black shrink-0">
                                                                {userName.charAt(0).toUpperCase()}
                                                            </div>
                                                            <div className="min-w-0">
                                                                <p className="text-[11px] font-black text-slate-700 truncate">{userName}</p>
                                                                <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest truncate">{getAssignedProjectRole(user)}</p>
                                                            </div>
                                                        </div>
                                                    );
                                                }) : (
                                                    <p className="text-[10px] font-bold text-slate-400 italic bg-slate-50 rounded-xl p-2 border border-dashed border-slate-100">
                                                        No volunteer assigned
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    );
                                }) : <div className="h-20 flex items-center justify-center border-2 border-dashed border-slate-100 rounded-[1.5rem] opacity-40"><p className="text-[9px] font-bold uppercase tracking-widest">Empty Slot</p></div>}
                            </div>
                        </div>
                    );
                })}
            </div>

            <BaseModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={taskToEdit ? 'Update Task' : 'New Task Assignment'}>
                <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="space-y-1">
                        <label className="text-[9px] font-black uppercase text-[#005587] ml-2 block tracking-widest">Task Objective</label>
                        <input required type="text" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-xs font-bold outline-none focus:border-blue-300 transition-all" />
                    </div>
                    <div className="space-y-1">
                        <label className="text-[9px] font-black uppercase text-[#005587] ml-2 block tracking-widest">Description</label>
                        <textarea rows="3" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-xs font-bold outline-none focus:border-blue-300 transition-all resize-none" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="text-[9px] font-black uppercase text-[#005587] ml-2 block tracking-widest">Deadline</label>
                            <input required type="date" min={new Date().toISOString().split('T')[0]} value={formData.due_date} onChange={e => setFormData({...formData, due_date: e.target.value})} className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-xs font-bold outline-none cursor-pointer" />
                        </div>
                        <CustomDropdown 
                            label="Priority"
                            value={formData.priority}
                            onChange={val => setFormData({...formData, priority: val})}
                            options={[
                                { value: 'Low', label: 'Low' },
                                { value: 'Medium', label: 'Medium' },
                                { value: 'High', label: 'High 🔥' }
                            ]}
                        />
                    </div>
                    <CustomDropdown 
                        label={taskToEdit ? 'Status Update' : 'Initial Status'}
                        value={formData.status}
                        onChange={val => setFormData({...formData, status: val})}
                        options={[
                            { value: 'To Do', label: 'To Do' },
                            { value: 'In Progress', label: 'In Progress' },
                            { value: 'Completed', label: 'Completed' }
                        ]}
                    />
                    <div className="space-y-3">
                        <label className="text-[9px] font-black uppercase text-[#005587] ml-2 block tracking-widest">Select Team Members</label>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-52 overflow-y-auto pr-2 custom-scrollbar">
                            {teamMembers.length > 0 ? teamMembers.map(m => {
                                const memberId = getMemberId(m);
                                const memberName = getMemberName(m);
                                const projectRole = getProjectRole(m);
                                const isSelected = formData.assigned_users.some(id => String(id) === String(memberId));

                                return (
                                    <div key={memberId} onClick={() => handleAssignUser(memberId)} className={`p-3 rounded-xl border cursor-pointer transition-all flex items-center justify-between gap-3 min-w-0 ${isSelected ? 'bg-blue-50 border-[#00629B] text-[#00629B]' : 'bg-white border-slate-100 text-slate-600 hover:border-blue-200'}`}>
                                        <div className="min-w-0">
                                            <p className="text-[11px] font-black truncate">{memberName}</p>
                                            <p className={`text-[8px] font-black uppercase tracking-widest truncate mt-1 ${isSelected ? 'text-[#00629B]' : 'text-slate-400'}`}>
                                                {projectRole}
                                            </p>
                                        </div>
                                        {isSelected && <CheckCircle2 size={14} className="shrink-0" />}
                                    </div>
                                );
                            }) : (
                                <p className="col-span-2 text-[10px] text-amber-500 italic p-2 bg-amber-50 rounded-lg border border-amber-100 text-center">No active members found.</p>
                            )}
                        </div>
                    </div>
                    <button type="submit" disabled={submitting || (!taskToEdit && formData.assigned_users.length === 0)} className="w-full bg-[#00629B] text-white py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-xl disabled:opacity-50 transition-all active:scale-95">
                        {submitting ? 'Processing...' : (taskToEdit ? 'Save Changes' : 'Deploy Task')}
                    </button>
                </form>
            </BaseModal>

            <BaseModal 
                isOpen={deleteModal.isOpen} 
                onClose={closeDeleteModal} 
                title="Delete Task"
                showCloseButton={!deleteSubmitting}
            >
                <div className="space-y-6">
                    <div className="flex items-start gap-4 rounded-2xl border border-rose-100 bg-rose-50/60 p-4">
                        <div className="w-11 h-11 rounded-2xl bg-white text-rose-500 flex items-center justify-center shrink-0 shadow-sm">
                            <Trash2 size={18} />
                        </div>
                        <div className="min-w-0">
                            <p className="text-sm font-black text-slate-800 uppercase tracking-tight">
                                {deleteModal.task?.title || 'Selected Task'}
                            </p>
                            <p className="text-xs font-bold text-slate-500 leading-relaxed mt-1">
                                This will permanently delete the task and remove its volunteer assignments.
                            </p>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <button
                            type="button"
                            onClick={closeDeleteModal}
                            disabled={deleteSubmitting}
                            className="py-3.5 rounded-2xl border border-slate-100 bg-white text-slate-500 text-[10px] font-black uppercase tracking-widest hover:bg-slate-50 transition-all disabled:opacity-50"
                        >
                            Cancel
                        </button>
                        <button
                            type="button"
                            onClick={handleDelete}
                            disabled={deleteSubmitting}
                            className="py-3.5 rounded-2xl bg-rose-500 text-white text-[10px] font-black uppercase tracking-widest shadow-lg shadow-rose-100 hover:bg-rose-600 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            {deleteSubmitting ? <><Loader2 size={14} className="animate-spin" /> Deleting</> : <><Trash2 size={14} /> Delete</>}
                        </button>
                    </div>
                </div>
            </BaseModal>

            <BaseModal isOpen={isEvalModalOpen} onClose={() => !evalSubmitting && setIsEvalModalOpen(false)} title="Evaluate Team Performance">
                <div className="space-y-6">
                    <div className="bg-blue-50/50 p-4 rounded-2xl border border-blue-100 mb-2">
                        <h4 className="text-xs font-black text-[#00629B] uppercase mb-1">Task: {evalTask?.title}</h4>
                        <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest italic">Select members below to submit evaluations</p>
                    </div>

                    <div className="max-h-[55vh] overflow-y-auto space-y-4 pr-2 custom-scrollbar">
                        {teamMembers.map(user => {
                            const uid = user.user_id || user.id;
                            const evalData = evaluations[uid] || { rating: 5, feedback: '', isSelected: false };
                            
                            return (
                                <div key={uid} className={`transition-all duration-300 border rounded-2xl p-4 ${evalData.isSelected ? 'bg-white border-blue-200 shadow-md translate-x-1' : 'bg-slate-50/50 border-slate-100 opacity-60'}`}>
                                    <div className="flex justify-between items-center">
                                        <div className="flex items-center gap-3 cursor-pointer" onClick={() => toggleMemberInEval(uid)}>
                                            <div className={`w-5 h-5 rounded-md border flex items-center justify-center transition-colors ${evalData.isSelected ? 'bg-blue-600 border-blue-600 text-white' : 'bg-white border-slate-300'}`}>
                                                {evalData.isSelected && <CheckCircle2 size={12}/>}
                                            </div>
                                            <div>
                                                <p className="text-[11px] font-black text-slate-800 uppercase">{user.full_name || user.username}</p>
                                                <p className="text-[8px] font-bold text-slate-400 uppercase tracking-tighter">{getProjectRole(user)}</p>
                                            </div>
                                        </div>
                                        
                                        {evalData.isSelected && (
                                            <div className="flex gap-1 animate-in zoom-in-75">
                                                {[1, 2, 3, 4, 5].map(star => (
                                                    <Star 
                                                        key={star} 
                                                        size={18} 
                                                        onClick={() => handleRatingChange(uid, star)}
                                                        className={`cursor-pointer transition-transform active:scale-125 ${star <= evalData.rating ? 'text-amber-400 fill-amber-400' : 'text-slate-200 hover:text-amber-200'}`} 
                                                    />
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                    
                                    {evalData.isSelected && (
                                        <div className="mt-4 animate-in slide-in-from-top-2 relative">
                                            <MessageSquare size={14} className="absolute top-3 left-3 text-slate-300" />
                                            <textarea 
                                                rows="2" 
                                                placeholder="Write feedback for this volunteer..." 
                                                value={evalData.feedback}
                                                onChange={(e) => handleFeedbackChange(uid, e.target.value)}
                                                className="w-full bg-slate-50 border border-slate-100 rounded-xl pl-9 pr-3 py-2 text-xs font-bold outline-none focus:border-blue-200 resize-none shadow-inner"
                                            />
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>

                    <button onClick={submitEvaluations} disabled={evalSubmitting} className="w-full bg-amber-500 hover:bg-amber-600 text-white py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-xl shadow-amber-500/30 disabled:opacity-50 transition-all flex items-center justify-center gap-2 active:scale-95">
                        {evalSubmitting ? 'Processing...' : <><Award size={16}/> Submit All Evaluations</>}
                    </button>
                </div>
            </BaseModal>
        </div>
    );
};

export default TasksBoard;
