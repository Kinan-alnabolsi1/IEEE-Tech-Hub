import React, { useState, useEffect } from 'react';
import { volunteerService } from '../../services/volunteerService';
import Loader from '../../components/ui/Loader';
import { User, Mail, Phone, GraduationCap, BookOpen, Star, Calendar, Briefcase, ShieldCheck, Award, Edit3, Trash2, Plus, Save, X, Lock } from 'lucide-react';
import toast from 'react-hot-toast';

const Profile = () => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    
    // حالات التعديل
    const [isEditing, setIsEditing] = useState(false);
    const [saving, setSaving] = useState(false);
    
    const [availableSkills, setAvailableSkills] = useState([]);
    const [currentSkill, setCurrentSkill] = useState({ skill_id: '', level: 3, experience_years: 0 });
    const [formData, setFormData] = useState({
        faculty: '', major: '', current_study_year: 1, enrollment_year: '', 
        expected_graduation_date: '', bio: '', phone: '', skills: []
    });

    const fetchProfileData = async () => {
        try {
            setLoading(true);
            const [profileRes, skillsRes] = await Promise.all([
                volunteerService.getProfile(),
                volunteerService.getSkills()
            ]);
            
            setUser(profileRes.data?.data || profileRes.data);
            setAvailableSkills(skillsRes.data?.data || skillsRes.data || []);
        } catch (error) {
            console.error("Profile Fetch Error:", error);
            toast.error("Failed to load profile data.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProfileData();
    }, []);

    // تفعيل وضع التعديل وتعبئة البيانات
    const toggleEditMode = () => {
        if (!isEditing) {
            const mappedSkills = (user.skills || []).map(s => ({
                skill_id: s.id || s.skill_id || s.pivot?.skill_id,
                name: s.name || s.skill_name,
                level: s.level || s.pivot?.level || 3,
                experience_years: s.experience_years || s.pivot?.experience_years || 0
            }));

            let rawPhone = user.phone || '';
            if (rawPhone.startsWith('+963')) rawPhone = rawPhone.replace('+963', '');

            setFormData({
                faculty: user.faculty || '',
                major: user.major || '',
                current_study_year: user.current_study_year || 1,
                enrollment_year: user.enrollment_year || '',
                expected_graduation_date: user.expected_graduation_date ? user.expected_graduation_date.substring(0, 10) : '',
                bio: user.bio || '',
                phone: rawPhone,
                skills: mappedSkills
            });
        }
        setIsEditing(!isEditing);
    };

    // إدارة المهارات
    const handleAddSkill = () => {
        if (!currentSkill.skill_id) return toast.error("Please select a skill.");
        if (currentSkill.level < 1 || currentSkill.level > 5) return toast.error("Level must be 1-5.");
        if (formData.skills.some(s => String(s.skill_id) === String(currentSkill.skill_id))) return toast.error("Skill already added.");

        const skillObj = availableSkills.find(s => String(s.skill_id || s.id) === String(currentSkill.skill_id));
        setFormData(prev => ({
            ...prev,
            skills: [...prev.skills, { ...currentSkill, name: skillObj?.name }]
        }));
        setCurrentSkill({ skill_id: '', level: 3, experience_years: 0 });
    };

    const handleRemoveSkill = (index) => {
        setFormData(prev => ({
            ...prev,
            skills: prev.skills.filter((_, i) => i !== index)
        }));
    };

    // حفظ التعديلات
    const handleSaveProfile = async () => {
        if (formData.phone && formData.phone.length < 9) {
            return toast.error("Please enter a valid 9-digit phone number.");
        }

        setSaving(true);
        try {
            const submissionData = {
                ...formData,
                phone: formData.phone ? `+963${formData.phone}` : user.phone,
                enrollment_year: parseInt(formData.enrollment_year) || null,
                current_study_year: parseInt(formData.current_study_year) || 1
            };

            await volunteerService.updateProfile(submissionData);
            toast.success("Profile updated successfully!");
            setIsEditing(false);
            fetchProfileData(); 
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to update profile.");
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <Loader message="Loading your profile..." />;
    if (!user) return <div className="text-center p-10 text-slate-500 font-bold">Profile not found.</div>;

    const fullName = user.full_name || user.name || user.username || 'Unknown User';
    const role = localStorage.getItem('user_role')?.replace('_', ' ') || 'Volunteer';
    const skillsList = isEditing ? formData.skills : (user.skills || []);
    const projects = user.projects || [];

    return (
        <div className="p-4 md:p-10 animate-in fade-in duration-700 max-w-5xl mx-auto space-y-8">
            
            {/* 1. Header Card */}
            <div className={`bg-white rounded-[3rem] shadow-sm overflow-hidden relative transition-all duration-500 ${isEditing ? 'border-2 border-blue-300 shadow-blue-100' : 'border border-slate-100'}`}>
                
                {/* 🌟 أزرار التحكم بالوضع (Edit / Save / Cancel) */}
                <div className="absolute top-4 right-4 z-20 flex gap-2">
                    {isEditing ? (
                        <>
                            <button onClick={toggleEditMode} disabled={saving} className="flex items-center gap-2 bg-slate-900/50 hover:bg-slate-900 text-white backdrop-blur-md px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all">
                                <X size={14} /> Cancel
                            </button>
                            <button onClick={handleSaveProfile} disabled={saving} className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg shadow-emerald-500/30 px-5 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all hover:-translate-y-0.5">
                                {saving ? "Saving..." : <><Save size={14} /> Save</>}
                            </button>
                        </>
                    ) : (
                        <button onClick={toggleEditMode} className="flex items-center gap-2 bg-white/20 hover:bg-white text-white hover:text-[#00629B] backdrop-blur-md px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all shadow-sm border border-white/30 hover:border-white">
                            <Edit3 size={14} /> Edit Profile
                        </button>
                    )}
                </div>

                <div className="h-40 bg-gradient-to-r from-[#00629B] to-blue-400 w-full relative overflow-hidden">
                    <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
                </div>
                
                <div className="px-8 pb-8 sm:px-12 relative">
                    <div className="flex flex-col sm:flex-row items-center sm:items-end gap-6 -mt-16 relative z-10">
                        <div className={`w-32 h-32 bg-white rounded-full p-2 shadow-xl shrink-0 transition-transform ${isEditing && 'scale-105'}`}>
                            <div className="w-full h-full bg-blue-50 rounded-full flex items-center justify-center text-5xl font-black text-[#00629B] border border-blue-100">
                                {fullName.charAt(0).toUpperCase()}
                            </div>
                        </div>
                        
                        <div className="flex-1 text-center sm:text-left mb-2">
                            <div className="flex items-center justify-center sm:justify-start gap-2">
                                <h1 className="text-3xl font-black text-slate-800 uppercase italic tracking-tight">{fullName}</h1>
                                {isEditing && <Lock size={16} className="text-slate-300" title="Name cannot be changed" />}
                            </div>
                            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 mt-2">
                                <span className="px-3 py-1 bg-emerald-50 text-emerald-600 text-[10px] font-black uppercase tracking-widest rounded-lg flex items-center gap-1 border border-emerald-100">
                                    <ShieldCheck size={12} /> {role}
                                </span>
                                {user.university_id && (
                                    <span className="px-3 py-1 bg-slate-50 text-slate-500 text-[10px] font-bold uppercase tracking-widest rounded-lg border border-slate-200 flex items-center gap-1">
                                        ID: {user.university_id} {isEditing && <Lock size={10} className="text-slate-400"/>}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pb-10">
                {/* Left Column: Contact & Academic */}
                <div className="space-y-8">
                    
                    {/* Contact Info */}
                    <div className={`bg-white p-8 rounded-[2.5rem] shadow-sm border transition-colors ${isEditing ? 'border-blue-200' : 'border-slate-100'} space-y-6`}>
                        <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Contact Details</h3>
                        <div className="space-y-4">
                            <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100 opacity-70">
                                <div className="text-slate-400"><Mail size={18} /></div>
                                <div className="overflow-hidden flex-1">
                                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1">Email <Lock size={8}/></p>
                                    <p className="text-xs font-black text-slate-500 truncate">{user.email || 'N/A'}</p>
                                </div>
                            </div>

                            <div className={`flex items-center gap-4 p-4 rounded-2xl border transition-all ${isEditing ? 'bg-blue-50/50 border-blue-200 focus-within:ring-2 focus-within:ring-blue-100' : 'bg-slate-50 border-slate-100'}`}>
                                <div className={isEditing ? 'text-[#00629B]' : 'text-slate-400'}><Phone size={18} /></div>
                                <div className="flex-1">
                                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Phone Number</p>
                                    {isEditing ? (
                                        <div className="flex items-center">
                                            <span className="text-xs font-black text-slate-500 mr-2">+963</span>
                                            <input type="tel" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value.replace(/\D/g, '')})} maxLength="9" className="w-full bg-transparent text-xs font-bold outline-none text-[#00629B] placeholder-blue-300" placeholder="9X XXX XXXX" />
                                        </div>
                                    ) : (
                                        <p className="text-xs font-black text-slate-700">{user.phone || 'N/A'}</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Academic Info */}
                    <div className={`bg-white p-8 rounded-[2.5rem] shadow-sm border transition-colors ${isEditing ? 'border-blue-200' : 'border-slate-100'} space-y-6`}>
                        <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Academic Background</h3>
                        <div className="space-y-5">
                            
                            {/* Faculty & Major */}
                            <div className="flex items-start gap-3">
                                <GraduationCap size={16} className={`${isEditing ? 'text-[#00629B]' : 'text-slate-400'} mt-1 shrink-0 transition-colors`} />
                                <div className="flex-1 space-y-2">
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Faculty & Major</p>
                                    {isEditing ? (
                                        <div className="space-y-2">
                                            <input placeholder="Faculty" value={formData.faculty} onChange={e => setFormData({...formData, faculty: e.target.value})} className="w-full bg-slate-50 border border-blue-100 rounded-xl px-3 py-2 text-xs font-bold outline-none focus:border-blue-300 text-[#00629B]" />
                                            <input placeholder="Major" value={formData.major} onChange={e => setFormData({...formData, major: e.target.value})} className="w-full bg-slate-50 border border-blue-100 rounded-xl px-3 py-2 text-xs font-bold outline-none focus:border-blue-300 text-[#00629B]" />
                                        </div>
                                    ) : (
                                        <>
                                            <p className="text-sm font-black text-slate-700 leading-snug">{user.faculty || 'Not set'}</p>
                                            <p className="text-xs font-bold text-[#00629B]">{user.major || 'Not set'}</p>
                                        </>
                                    )}
                                </div>
                            </div>

                            {/* Dates */}
{/* Dates */}
                            <div className="pt-4 border-t border-slate-50 space-y-4">
                                {isEditing ? (
                                    <div className="pl-7 grid grid-cols-2 gap-3">
                                        <div className="space-y-1">
                                            <label className="text-[8px] font-black uppercase text-slate-400">Current Year</label>
                                            <input 
                                                type="number" 
                                                placeholder="e.g. 3" 
                                                value={formData.current_study_year} 
                                                onChange={e => setFormData({...formData, current_study_year: e.target.value})} 
                                                className="w-full bg-slate-50 border border-blue-100 rounded-xl px-3 py-2 text-xs font-bold outline-none focus:border-blue-300 text-[#00629B] [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" 
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-[8px] font-black uppercase text-slate-400">Enrollment Year</label>
                                            <input 
                                                type="number" 
                                                placeholder="e.g. 2020" 
                                                value={formData.enrollment_year} 
                                                onChange={e => setFormData({...formData, enrollment_year: e.target.value})} 
                                                className="w-full bg-slate-50 border border-blue-100 rounded-xl px-3 py-2 text-xs font-bold outline-none focus:border-blue-300 text-[#00629B] [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" 
                                            />
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-3">
                                        <BookOpen size={14} className="text-slate-400" />
                                        <p className="text-xs font-bold text-slate-600">Year {user.current_study_year || '-'} (Enrolled: {user.enrollment_year || '-'})</p>
                                    </div>
                                )}

                                <div className="flex items-center gap-3">
                                    <Calendar size={14} className={isEditing ? 'text-[#00629B] mt-5' : 'text-slate-400'} />
                                    {isEditing ? (
                                        <div className="flex-1 space-y-1">
                                            <label className="text-[8px] font-black uppercase text-slate-400">Graduation Date</label>
                                            <input 
                                                type="date" 
                                                value={formData.expected_graduation_date} 
                                                onChange={e => setFormData({...formData, expected_graduation_date: e.target.value})} 
                                                className="w-full bg-slate-50 border border-blue-100 rounded-xl px-3 py-2 text-xs font-bold outline-none focus:border-blue-300 text-[#00629B]" 
                                            />
                                        </div>
                                    ) : (
                                        <p className="text-xs font-bold text-slate-600">Expected Grad: {user.expected_graduation_date?.substring(0, 10) || 'Not set'}</p>
                                    )}
                                </div>
                            </div>

                        </div>
                    </div>
                </div>

                {/* Right Column: Bio, Skills & Projects */}
                <div className="lg:col-span-2 space-y-8">
                    
                    {/* Bio */}
                    <div className={`bg-white p-8 rounded-[2.5rem] shadow-sm border transition-colors ${isEditing ? 'border-blue-200' : 'border-slate-100'}`}>
                        <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Professional Bio</h3>
                        {isEditing ? (
                            <textarea rows="5" value={formData.bio} onChange={e => setFormData({...formData, bio: e.target.value})} className="w-full bg-blue-50/30 border border-blue-200 rounded-3xl p-6 text-sm font-medium outline-none focus:ring-2 focus:ring-blue-100 resize-none text-[#00629B] placeholder-blue-300" placeholder="Write about your passion and goals..."></textarea>
                        ) : (
                            <div className="p-6 bg-slate-50 rounded-3xl text-sm font-medium text-slate-600 leading-relaxed border border-slate-100 min-h-[140px]">
                                {user.bio ? user.bio : <span className="italic text-slate-400">No bio provided. Click edit to add your story.</span>}
                            </div>
                        )}
                    </div>

                    {/* Skills Grid */}
                    <div className={`bg-white p-8 rounded-[2.5rem] shadow-sm border transition-colors ${isEditing ? 'border-blue-200' : 'border-slate-100'}`}>
                        <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                            <Award size={16}/> Core Skills & Expertise
                        </h3>

                        {isEditing && (
                            <div className="flex flex-col sm:flex-row gap-2 mb-6 p-4 bg-slate-50 rounded-2xl border border-blue-100 animate-in slide-in-from-top-2">
                                <select value={currentSkill.skill_id} onChange={e => setCurrentSkill({...currentSkill, skill_id: e.target.value})} className="flex-[2] bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold outline-none cursor-pointer">
                                    <option value="" disabled>Select Skill to add...</option>
                                    {availableSkills.map(s => <option key={s.id || s.skill_id} value={s.id || s.skill_id}>{s.name}</option>)}
                                </select>
                                <input type="number" min="1" max="5" placeholder="Lvl 1-5" value={currentSkill.level} onChange={e => setCurrentSkill({...currentSkill, level: e.target.value})} className="w-20 bg-white border border-slate-200 rounded-xl px-2 py-2 text-xs font-bold text-center outline-none" title="Skill Level (1-5)" />
                                <input type="number" min="0" placeholder="Exp Yrs" value={currentSkill.experience_years} onChange={e => setCurrentSkill({...currentSkill, experience_years: e.target.value})} className="w-20 bg-white border border-slate-200 rounded-xl px-2 py-2 text-xs font-bold text-center outline-none" title="Years of Experience" />
                                <button type="button" onClick={handleAddSkill} className="bg-[#00629B] text-white p-2 rounded-xl hover:bg-slate-900 shadow-sm"><Plus size={16}/></button>
                            </div>
                        )}

                        {skillsList.length > 0 ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {skillsList.map((skill, idx) => {
                                    const skillName = skill.name || skill.skill_name || skill.pivot?.name || `Skill ${idx+1}`;
                                    const level = skill.level || skill.pivot?.level || 0;
                                    const exp = skill.experience_years || skill.pivot?.experience_years || 0;
                                    
                                    return (
                                        <div key={idx} className={`p-4 rounded-2xl border flex justify-between items-center group transition-colors ${isEditing ? 'bg-white border-blue-100 shadow-sm' : 'bg-slate-50 border-slate-100 hover:border-blue-200'}`}>
                                            <div>
                                                <p className="text-xs font-black text-slate-800 uppercase pr-2 truncate">{skillName}</p>
                                                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">{exp} Yrs Exp</p>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <div className="flex items-center gap-1 bg-white px-2 py-1 rounded-lg border border-slate-100 shadow-sm">
                                                    <Star size={10} className="text-amber-400" fill="currentColor" />
                                                    <span className="text-[10px] font-black text-slate-700">Lvl {level}</span>
                                                </div>
                                                {isEditing && (
                                                    <button onClick={() => handleRemoveSkill(idx)} className="text-rose-400 hover:bg-rose-50 p-1.5 rounded-lg transition-colors"><Trash2 size={14}/></button>
                                                )}
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        ) : (
                            <div className="text-center p-6 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-bold text-slate-400 uppercase tracking-widest">
                                No skills added yet.
                            </div>
                        )}
                    </div>

                    {/* Active Projects (Read Only دائماً) */}
                    {projects.length > 0 && !isEditing && (
                        <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 animate-in fade-in">
                            <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-6 flex items-center gap-2"><Briefcase size={16}/> Enrolled Missions</h3>
                            <div className="space-y-4">
                                {projects.map((proj, idx) => (
                                    <div key={idx} className="p-5 bg-slate-50 rounded-[1.5rem] border border-slate-100 flex items-center justify-between">
                                        <div>
                                            <h4 className="text-sm font-black text-slate-800 uppercase italic">{proj.name || proj.title}</h4>
                                            <p className="text-[10px] font-bold text-[#00629B] uppercase tracking-widest mt-1">{proj.pivot?.role || proj.role_in_project || 'Member'}</p>
                                        </div>
                                        <span className="px-3 py-1 bg-white text-slate-500 text-[9px] font-black uppercase tracking-widest rounded-lg border border-slate-200 shadow-sm">
                                            {proj.status || 'Active'}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Profile;