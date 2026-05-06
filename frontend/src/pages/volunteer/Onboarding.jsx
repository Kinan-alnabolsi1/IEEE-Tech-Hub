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

    // 🌟 التعديل هنا: شلنا الداتا الوهمية وصار يقرأ من السيرفر فقط
    useEffect(() => {
        const fetchSkills = async () => {
            try {
                const res = await volunteerService.getSkills();
                // أخذنا الداتا الحقيقية من السيرفر
                setAvailableSkills(res.data?.data || res.data || []);
            } catch (error) {
                console.error("Failed to load skills from backend:", error);
                toast.error("Could not load skills list from server.");
            }
        };
        fetchSkills();
    }, []);

    const handleNext = () => setStep(s => s + 1);
    const handleBack = () => setStep(s => s - 1);

    const handleAddSkill = () => {
        if (!currentSkill.skill_id) return toast.error("Please select a skill.");
        
        if (formData.skills.some(s => String(s.skill_id) === String(currentSkill.skill_id))) {
            return toast.error("You already added this skill!");
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
                    experience_years: parseInt(currentSkill.experience_years)
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
        setLoading(true);
        try {
            const submissionData = {
                ...formData,
                enrollment_year: parseInt(formData.enrollment_year),
                current_study_year: parseInt(formData.current_study_year),
                expected_graduation_date: formData.expected_graduation_date,
                phone: formData.phone ? `+963${formData.phone}` : ''
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
            <div className="w-full max-w-2xl bg-white rounded-[3rem] shadow-2xl shadow-blue-100/50 overflow-hidden relative border border-slate-100">
                
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
                        {step === 1 && (
                            <div className="space-y-4 animate-in slide-in-from-right-5 duration-300">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-2">Faculty</label>
                                        <input required className="w-full bg-slate-50 border-none rounded-2xl py-4 px-6 text-xs font-bold outline-none focus:ring-2 focus:ring-blue-100" placeholder="e.g. Engineering" value={formData.faculty} onChange={e => setFormData({...formData, faculty: e.target.value})} />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-2">Major</label>
                                        <input required className="w-full bg-slate-50 border-none rounded-2xl py-4 px-6 text-xs font-bold outline-none focus:ring-2 focus:ring-blue-100" placeholder="e.g. AI & Robotics" value={formData.major} onChange={e => setFormData({...formData, major: e.target.value})} />
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div className="space-y-1">
                                        <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-2">Study Year</label>
                                        <div className="flex bg-slate-50 rounded-2xl overflow-hidden focus-within:ring-2 focus-within:ring-blue-100">
                                            <button type="button" onClick={decrementYear} className="px-4 text-[#00629B] hover:bg-slate-200 transition-colors flex items-center justify-center">
                                                <Minus size={14} strokeWidth={3} />
                                            </button>
                                            <input 
                                                type="number" required 
                                                className="w-full bg-transparent border-none py-4 text-center text-xs font-black outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" 
                                                value={formData.current_study_year} 
                                                onChange={e => setFormData({...formData, current_study_year: parseInt(e.target.value) || ''})} 
                                            />
                                            <button type="button" onClick={incrementYear} className="px-4 text-[#00629B] hover:bg-slate-200 transition-colors flex items-center justify-center">
                                                <Plus size={14} strokeWidth={3} />
                                            </button>
                                        </div>
                                    </div>

                                    <div className="space-y-1">
                                        <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-2">Enrollment Year</label>
                                        <input type="number" required className="w-full bg-slate-50 border-none rounded-2xl py-4 px-6 text-xs font-bold outline-none focus:ring-2 focus:ring-blue-100" placeholder="e.g. 2022" value={formData.enrollment_year} onChange={e => setFormData({...formData, enrollment_year: e.target.value})} />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-2">Expected Grad</label>
                                        <input type="date" required className="w-full bg-slate-50 border-none rounded-2xl py-4 px-6 text-xs font-bold outline-none focus:ring-2 focus:ring-blue-100 text-slate-500 cursor-pointer" value={formData.expected_graduation_date} onChange={e => setFormData({...formData, expected_graduation_date: e.target.value})} />
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* STEP 2: Skills */}
                        {step === 2 && (
                            <div className="space-y-6 animate-in slide-in-from-right-5 duration-300">
                                <div className="space-y-2">
                                    <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-2">Add Your Skills</label>
                                    <div className="bg-slate-50 p-4 rounded-[2rem] border border-slate-100 flex flex-col md:flex-row gap-3 items-center">
                                        <select 
                                            value={currentSkill.skill_id} 
                                            onChange={e => setCurrentSkill({...currentSkill, skill_id: e.target.value})}
                                            className="w-full md:flex-[2] bg-white border border-slate-100 rounded-xl px-4 py-3 text-xs font-bold outline-none text-slate-700 cursor-pointer"
                                        >
                                            <option value="" disabled>Select Skill...</option>
                                            {availableSkills.map(skill => (
                                                <option key={skill.skill_id} value={skill.skill_id}>{skill.name}</option>
                                            ))}
                                        </select>
                                        
                                        <div className="flex w-full md:w-auto gap-3 flex-1">
                                            <div className="flex-1 bg-white border border-slate-100 rounded-xl px-3 py-1 flex items-center flex-col justify-center">
                                                <span className="text-[8px] font-black uppercase text-slate-400">Level (1-5)</span>
                                                <input type="number" min="1" max="5" value={currentSkill.level} onChange={e => setCurrentSkill({...currentSkill, level: e.target.value})} className="w-full text-center text-xs font-bold outline-none bg-transparent"/>
                                            </div>
                                            <div className="flex-1 bg-white border border-slate-100 rounded-xl px-3 py-1 flex items-center flex-col justify-center">
                                                <span className="text-[8px] font-black uppercase text-slate-400">Exp (Yrs)</span>
                                                <input type="number" min="0" value={currentSkill.experience_years} onChange={e => setCurrentSkill({...currentSkill, experience_years: e.target.value})} className="w-full text-center text-xs font-bold outline-none bg-transparent"/>
                                            </div>
                                        </div>

                                        <button onClick={handleAddSkill} className="w-full md:w-auto bg-[#00629B] text-white p-3 rounded-xl hover:bg-slate-900 transition-colors shadow-sm flex justify-center items-center">
                                            <Plus size={18} strokeWidth={3}/>
                                        </button>
                                    </div>

                                    <div className="pt-2 grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        {formData.skills.map((skill, index) => (
                                            <div key={index} className="bg-white border border-slate-100 p-4 rounded-2xl flex items-center justify-between shadow-sm group hover:border-blue-100 transition-all">
                                                <div>
                                                    <h4 className="text-xs font-black text-slate-800 uppercase">{skill.name}</h4>
                                                    <div className="flex items-center gap-3 mt-1.5">
                                                        <div className="flex items-center gap-1 text-amber-400">
                                                            <Star size={10} fill="currentColor" />
                                                            <span className="text-[10px] font-bold text-slate-600">Lvl {skill.level}</span>
                                                        </div>
                                                        <div className="w-1 h-1 rounded-full bg-slate-200"></div>
                                                        <span className="text-[9px] font-bold uppercase tracking-widest text-slate-400">{skill.experience_years} Yrs Exp</span>
                                                    </div>
                                                </div>
                                                <button onClick={() => handleRemoveSkill(index)} className="p-2 text-slate-300 hover:text-rose-500 bg-slate-50 hover:bg-rose-50 rounded-lg transition-colors">
                                                    <Trash2 size={14} />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* STEP 3: Professional Bio */}
                        {step === 3 && (
                            <div className="space-y-4 animate-in slide-in-from-right-5 duration-300">
                                <div className="space-y-2">
                                    <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-2">Tell us your story</label>
                                    <textarea 
                                        rows="8" 
                                        className="w-full bg-slate-50 border-none rounded-[2rem] p-6 text-xs font-bold outline-none focus:ring-2 focus:ring-blue-100 resize-none leading-relaxed" 
                                        placeholder="Write a brief professional bio about your passion, what you aim to achieve in this chapter, and your volunteering spirit..." 
                                        value={formData.bio} 
                                        onChange={e => setFormData({...formData, bio: e.target.value})}
                                    ></textarea>
                                </div>
                            </div>
                        )}

                        {/* STEP 4: Phone & Finish */}
                        {step === 4 && (
                            <div className="space-y-8 animate-in slide-in-from-right-5 duration-300">
                                <div className="p-8 bg-blue-50/50 rounded-[2.5rem] border border-blue-100 text-center space-y-4">
                                    <Sparkles className="mx-auto text-blue-500" size={40} />
                                    <h3 className="text-lg font-black text-slate-800 tracking-tight">Ready to Join?</h3>
                                    <p className="text-[11px] font-bold text-slate-500 leading-relaxed">Your professional profile is ready. Project leaders can now see your expertise.</p>
                                </div>
                                
                                <div className="space-y-2 px-2 md:px-8">
                                    <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-2">WhatsApp / Phone Number</label>
                                    <div className="flex bg-slate-50 rounded-2xl overflow-hidden focus-within:ring-2 focus-within:ring-blue-100">
                                        <div className="flex items-center justify-center px-4 bg-slate-100 border-r border-slate-200">
                                            <span className="text-xs font-black text-slate-600 tracking-widest">+963</span>
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
                                <button type="button" onClick={handleBack} className="flex-1 py-4 bg-slate-100 text-slate-400 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 transition-colors hover:bg-slate-200 hover:text-slate-600">
                                    <ChevronLeft size={16} /> Back
                                </button>
                            )}
                            {step < 4 ? (
                                <button type="button" onClick={handleNext} className="flex-[2] py-4 bg-[#00629B] text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] shadow-xl flex items-center justify-center gap-2 transition-all hover:-translate-y-1">
                                    Next Phase <ChevronRight size={16} />
                                </button>
                            ) : (
                                <button type="button" onClick={handleFinish} className="flex-[2] py-4 bg-emerald-500 text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] shadow-xl flex items-center justify-center gap-2 transition-all hover:-translate-y-1 hover:shadow-emerald-500/30">
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