import React, { useState, useEffect } from 'react';
import { volunteerService } from '../../services/volunteerService';
import Loader from '../../components/ui/Loader';
import { GraduationCap, Award, UserCheck, ChevronRight, ChevronLeft, Save, Sparkles, Plus, Trash2, Star, BookOpen, Minus } from 'lucide-react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

const Onboarding = () => {
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    
    const [availableSkills, setAvailableSkills] = useState([]);
    const [currentSkill, setCurrentSkill] = useState({ skill_id: '', level: 3, experience_years: 0 });

    const [formData, setFormData] = useState({
        faculty: '', 
        major: '', 
        current_study_year: 1, 
        enrollment_year: '', 
        expected_graduation_date: '', 
        bio: '', 
        phone: '', 
        skills: [] 
    });

    useEffect(() => {
        const fetchSkills = async () => {
            try {
                const res = await volunteerService.getSkills();
                setAvailableSkills(res.data?.data || res.data || []);
            } catch (error) {
                console.error("Failed to load skills:", error);
                toast.error("Could not load skills list.");
            }
        };
        fetchSkills();
    }, []);

    // 🌟 دالة التحقق من صحة البيانات قبل الانتقال لكل خطوة
    const validateStep = () => {
        if (step === 1) {
            if (!formData.faculty.trim()) { toast.error("Faculty is required."); return false; }
            if (!formData.enrollment_year) { toast.error("Enrollment year is required."); return false; }
            if (!formData.expected_graduation_date) { toast.error("Expected graduation date is required."); return false; }
        }
        if (step === 3) {
            if (!formData.bio.trim() || formData.bio.length < 20) {
                toast.error("Please write a bio (at least 20 characters).");
                return false;
            }
        }
        return true;
    };

    const handleNext = () => {
        if (validateStep()) setStep(s => s + 1);
    };

    const handleBack = () => setStep(s => s - 1);

    const handleAddSkill = () => {
        if (!currentSkill.skill_id) return toast.error("Please select a skill.");
        
        // التحقق من المستوى (بما أنه إجباري للمهارة المضافة)
        if (currentSkill.level < 1 || currentSkill.level > 5) return toast.error("Level must be 1-5.");

        if (formData.skills.some(s => String(s.skill_id) === String(currentSkill.skill_id))) {
            return toast.error("Skill already added.");
        }

        const skillObj = availableSkills.find(s => String(s.skill_id) === String(currentSkill.skill_id));

        setFormData({
            ...formData,
            skills: [
                ...formData.skills,
                {
                    skill_id: parseInt(currentSkill.skill_id),
                    name: skillObj?.name,
                    level: parseInt(currentSkill.level),
                    experience_years: parseInt(currentSkill.experience_years) || 0 // الخبرة يمكن أن تكون 0
                }
            ]
        });

        setCurrentSkill({ skill_id: '', level: 3, experience_years: 0 });
    };

    const handleRemoveSkill = (index) => {
        setFormData({
            ...formData,
            skills: formData.skills.filter((_, i) => i !== index)
        });
    };

    const incrementYear = () => setFormData(prev => ({ ...prev, current_study_year: prev.current_study_year + 1 }));
    const decrementYear = () => setFormData(prev => ({ ...prev, current_study_year: Math.max(1, prev.current_study_year - 1) }));

    const handleFinish = async () => {
        if (!formData.phone || formData.phone.length < 9) {
            return toast.error("Please enter a valid 9-digit phone number.");
        }

        setLoading(true);
        try {
            const submissionData = {
                ...formData,
                enrollment_year: parseInt(formData.enrollment_year),
                current_study_year: parseInt(formData.current_study_year),
                phone: `+963${formData.phone}`
            };

            await volunteerService.completeOnboarding(submissionData);
            toast.success("Profile Setup Complete!");
            navigate('/volunteer'); 
        } catch (error) {
            const serverErrors = error.response?.data?.errors;
            const message = serverErrors 
                ? Object.values(serverErrors).flat()[0] 
                : (error.response?.data?.message || "Check your data and try again");
            toast.error(message);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <Loader message="Finalizing your profile..." />;

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
            <div className="w-full max-w-2xl bg-white rounded-[3rem] shadow-2xl border border-slate-100 overflow-hidden relative">
                
                {/* Progress Bar */}
                <div className="absolute top-0 left-0 w-full h-1.5 bg-slate-50 flex">
                    <div className="h-full bg-[#00629B] transition-all duration-500" style={{ width: `${(step / 4) * 100}%` }}></div>
                </div>

                <div className="p-8 md:p-12">
                    <div className="text-center mb-10">
                        <div className="inline-flex p-4 bg-blue-50 rounded-[2rem] text-[#00629B] mb-4">
                            {step === 1 && <GraduationCap size={32} />}
                            {step === 2 && <Award size={32} />}
                            {step === 3 && <BookOpen size={32} />}
                            {step === 4 && <UserCheck size={32} />}
                        </div>
                        <h1 className="text-2xl font-black text-slate-800 uppercase tracking-tight italic">
                            {step === 1 && "Academic Identity"}
                            {step === 2 && "Skills & Expertise"}
                            {step === 3 && "Professional Bio"}
                            {step === 4 && "Final Touches"}
                        </h1>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.3em] mt-2">Step {step} of 4</p>
                    </div>

                    <form onSubmit={(e) => e.preventDefault()} className="space-y-6">
                        
                        {/* STEP 1: Academic Info */}
                        {/* STEP 1: Academic Info */}
{step === 1 && (
    <div className="space-y-6 animate-in slide-in-from-right-5 duration-300">
        {/* السطر الأول: الكلية والتخصص */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Faculty *</label>
                <input 
                    required 
                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 px-6 text-xs font-bold outline-none focus:ring-2 focus:ring-blue-100 transition-all" 
                    placeholder="e.g. Engineering" 
                    value={formData.faculty} 
                    onChange={e => setFormData({...formData, faculty: e.target.value})} 
                />
            </div>
            <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Major (Optional)</label>
                <input 
                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 px-6 text-xs font-bold outline-none focus:ring-2 focus:ring-blue-100 transition-all" 
                    placeholder="e.g. Computer Science" 
                    value={formData.major} 
                    onChange={e => setFormData({...formData, major: e.target.value})} 
                />
            </div>
        </div>

        {/* السطر الثاني: السنة الدراسية الحالية - جعلناه منفصلاً ليعطي مساحة */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
            <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Current Study Year</label>
                <div className="flex bg-slate-50 border border-slate-100 rounded-2xl overflow-hidden h-[54px]">
                    <button type="button" onClick={decrementYear} className="px-5 text-[#00629B] hover:bg-slate-200 transition-colors flex items-center justify-center border-r border-slate-100">
                        <Minus size={16} strokeWidth={3} />
                    </button>
                    <div className="flex-1 flex items-center justify-center text-xs font-black text-slate-700 bg-white">
                        {formData.current_study_year}
                    </div>
                    <button type="button" onClick={incrementYear} className="px-5 text-[#00629B] hover:bg-slate-200 transition-colors flex items-center justify-center border-l border-slate-100">
                        <Plus size={16} strokeWidth={3} />
                    </button>
                </div>
            </div>

            {/* تم تحويل الـ Enrollment لحقل إدخال عادي */}
            <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Enrollment Year *</label>
                <input 
                    type="number" 
                    required 
                    min="2000"
                    max="2026"
                    placeholder="2022"
                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 px-6 text-xs font-bold outline-none focus:ring-2 focus:ring-blue-100 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" 
                    value={formData.enrollment_year} 
                    onChange={e => setFormData({...formData, enrollment_year: e.target.value})} 
                />
            </div>

            <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Graduation Date *</label>
                <input 
                    type="date" 
                    required 
                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 px-6 text-xs font-bold outline-none focus:ring-2 focus:ring-blue-100 text-slate-500 cursor-pointer" 
                    value={formData.expected_graduation_date} 
                    onChange={e => setFormData({...formData, expected_graduation_date: e.target.value})} 
                />
            </div>
        </div>
    </div>
)}

                        {/* STEP 2: Skills */}
                        {step === 2 && (
                            <div className="space-y-6 animate-in slide-in-from-right-5 duration-300">
                                <div className="space-y-2">
                                    <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-2">Add Your Skills (Optional)</label>
                                    <div className="bg-slate-50 p-4 rounded-[2rem] border border-slate-100 flex flex-col md:flex-row gap-3 items-center">
                                        <select 
                                            value={currentSkill.skill_id} 
                                            onChange={e => setCurrentSkill({...currentSkill, skill_id: e.target.value})}
                                            className="w-full md:flex-[2] bg-white border border-slate-100 rounded-xl px-4 py-3 text-xs font-bold outline-none text-slate-700"
                                        >
                                            <option value="" disabled>Select Skill...</option>
                                            {availableSkills.map(skill => (
                                                <option key={skill.skill_id} value={skill.skill_id}>{skill.name}</option>
                                            ))}
                                        </select>
                                        
                                        <div className="flex w-full md:w-auto gap-3 flex-1">
                                            <div className="flex-1 bg-white border border-slate-100 rounded-xl px-3 py-1 flex flex-col items-center">
                                                <span className="text-[8px] font-black text-slate-400 uppercase">Level *</span>
                                                <input type="number" min="1" max="5" value={currentSkill.level} onChange={e => setCurrentSkill({...currentSkill, level: e.target.value})} className="w-full text-center text-xs font-bold outline-none bg-transparent"/>
                                            </div>
                                            <div className="flex-1 bg-white border border-slate-100 rounded-xl px-3 py-1 flex flex-col items-center">
                                                <span className="text-[8px] font-black text-slate-400 uppercase">Exp (Yrs)</span>
                                                <input type="number" min="0" value={currentSkill.experience_years} onChange={e => setCurrentSkill({...currentSkill, experience_years: e.target.value})} className="w-full text-center text-xs font-bold outline-none bg-transparent"/>
                                            </div>
                                        </div>

                                        <button type="button" onClick={handleAddSkill} className="w-full md:w-auto bg-[#00629B] text-white p-3 rounded-xl hover:bg-slate-900 transition-colors shadow-sm">
                                            <Plus size={18} strokeWidth={3}/>
                                        </button>
                                    </div>

                                    <div className="pt-2 grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        {formData.skills.map((skill, index) => (
                                            <div key={index} className="bg-white border border-slate-100 p-4 rounded-2xl flex items-center justify-between shadow-sm">
                                                <div>
                                                    <h4 className="text-xs font-black text-slate-800 uppercase">{skill.name}</h4>
                                                    <div className="flex items-center gap-2 mt-1">
                                                        <span className="text-[10px] font-bold text-amber-500">Lvl {skill.level}</span>
                                                        <span className="text-[9px] font-bold text-slate-400">{skill.experience_years} Yrs Exp</span>
                                                    </div>
                                                </div>
                                                <button onClick={() => handleRemoveSkill(index)} className="p-2 text-slate-300 hover:text-rose-500"><Trash2 size={14} /></button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* STEP 3: Bio */}
                        {step === 3 && (
                            <div className="space-y-4 animate-in slide-in-from-right-5 duration-300">
                                <div className="space-y-2">
                                    <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-2">Bio (Required) *</label>
                                    <textarea 
                                        rows="8" 
                                        className="w-full bg-slate-50 border-none rounded-[2rem] p-6 text-xs font-bold outline-none focus:ring-2 focus:ring-blue-100 resize-none leading-relaxed" 
                                        placeholder="Write about your passion and goals (min 20 characters)..." 
                                        value={formData.bio} 
                                        onChange={e => setFormData({...formData, bio: e.target.value})}
                                    ></textarea>
                                </div>
                            </div>
                        )}

                        {/* STEP 4: Phone */}
                        {step === 4 && (
                            <div className="space-y-8 animate-in slide-in-from-right-5 duration-300">
                                <div className="p-8 bg-blue-50/50 rounded-[2.5rem] border border-blue-100 text-center space-y-4">
                                    <Sparkles className="mx-auto text-blue-500" size={40} />
                                    <h3 className="text-lg font-black text-slate-800 tracking-tight">Final Setup</h3>
                                    <p className="text-[11px] font-bold text-slate-500 leading-relaxed">Your professional profile is ready to be deployed.</p>
                                </div>
                                <div className="space-y-2 px-8">
                                    <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-2">Phone Number *</label>
                                    <div className="flex bg-slate-50 rounded-2xl overflow-hidden focus-within:ring-2 focus-within:ring-blue-100">
                                        <div className="flex items-center px-4 bg-slate-100 border-r border-slate-200">
                                            <span className="text-xs font-black text-slate-600">+963</span>
                                        </div>
                                        <input 
                                            type="tel" 
                                            className="w-full bg-transparent border-none py-4 px-4 text-xs font-bold outline-none tracking-widest" 
                                            placeholder="9X XXX XXXX" 
                                            value={formData.phone} 
                                            onChange={e => setFormData({...formData, phone: e.target.value.replace(/\D/g, '')})} 
                                            maxLength="9"
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Navigation Buttons */}
                        <div className="flex gap-4 pt-6">
                            {step > 1 && (
                                <button type="button" onClick={handleBack} className="flex-1 py-4 bg-slate-100 text-slate-400 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-colors hover:bg-slate-200">
                                    <ChevronLeft size={16} /> Back
                                </button>
                            )}
                            {step < 4 ? (
                                <button type="button" onClick={handleNext} className="flex-[2] py-4 bg-[#00629B] text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] shadow-xl flex items-center justify-center gap-2 transition-all hover:-translate-y-1">
                                    Next Phase <ChevronRight size={16} />
                                </button>
                            ) : (
                                <button type="button" onClick={handleFinish} className="flex-[2] py-4 bg-emerald-500 text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] shadow-xl flex items-center justify-center gap-2 transition-all hover:-translate-y-1">
                                    Finish Setup <Save size={16} />
                                </button>
                            )}
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Onboarding;