import React, { useState } from 'react';
import { volunteerService } from '../../services/volunteerService';
import Loader from '../../components/ui/Loader';
import { GraduationCap, Award, UserCheck, ChevronRight, ChevronLeft, Save, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

const Onboarding = () => {
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);

    const [formData, setFormData] = useState({
        faculty: '', 
        major: '', 
        current_study_year: '', 
        enrollment_year: '', // سيُرسل كـ Integer (2021)
        expected_graduation_date: '', // سيُرسل كـ Date (2025-06-15)
        bio: '', 
        phone: '', 
        skills: []
    });

    const [skillInput, setSkillInput] = useState("");

    const handleNext = () => setStep(s => s + 1);
    const handleBack = () => setStep(s => s - 1);

    const handleAddSkill = (e) => {
        if (e.key === 'Enter' && skillInput.trim()) {
            e.preventDefault();
            if (!formData.skills.includes(skillInput.trim())) {
                setFormData({ ...formData, skills: [...formData.skills, skillInput.trim()] });
            }
            setSkillInput("");
        }
    };

    const handleFinish = async () => {
        setLoading(true);
        try {
            // 🌟 الخطوة الحاسمة: تجهيز البيانات بدقة قبل الإرسال
            const submissionData = {
                ...formData,
                // تحويل السنوات إلى أرقام صحيحة (Integers)
                enrollment_year: parseInt(formData.enrollment_year),
                current_study_year: parseInt(formData.current_study_year),
                // إرسال التاريخ كما هو (String بصيغة YYYY-MM-DD)
                expected_graduation_date: formData.expected_graduation_date 
            };

            await volunteerService.completeOnboarding(submissionData);
            toast.success("Profile Setup Complete!");
            navigate('/volunteer'); 
        } catch (error) {
            // استخراج رسالة الخطأ الدقيقة من السيرفر
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
                    <div className="h-full bg-[#00629B] transition-all duration-500" style={{ width: `${(step / 3) * 100}%` }}></div>
                </div>

                <div className="p-8 md:p-12">
                    <div className="text-center mb-10">
                        <div className="inline-flex p-4 bg-blue-50 rounded-[2rem] text-[#00629B] mb-4">
                            {step === 1 && <GraduationCap size={32} />}
                            {step === 2 && <Award size={32} />}
                            {step === 3 && <UserCheck size={32} />}
                        </div>
                        <h1 className="text-2xl font-black text-slate-800 uppercase tracking-tight italic">
                            {step === 1 && "Academic Identity"}
                            {step === 2 && "Skills & Expertise"}
                            {step === 3 && "Final Touches"}
                        </h1>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.3em] mt-2">Step {step} of 3</p>
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
                                        <input type="number" required className="w-full bg-slate-50 border-none rounded-2xl py-4 px-6 text-xs font-bold outline-none focus:ring-2 focus:ring-blue-100" placeholder="Year" value={formData.current_study_year} onChange={e => setFormData({...formData, current_study_year: e.target.value})} />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-2">Enrollment Year (Number)</label>
                                        <input type="number" required className="w-full bg-slate-50 border-none rounded-2xl py-4 px-6 text-xs font-bold outline-none focus:ring-2 focus:ring-blue-100" placeholder="e.g. 2022" value={formData.enrollment_year} onChange={e => setFormData({...formData, enrollment_year: e.target.value})} />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-2">Expected Grad (Date)</label>
                                        {/* 🌟 نستخدم نوع date لضمان إرسال صيغة تاريخ صحيحة للسيرفر */}
                                        <input type="date" required className="w-full bg-slate-50 border-none rounded-2xl py-4 px-6 text-xs font-bold outline-none focus:ring-2 focus:ring-blue-100" value={formData.expected_graduation_date} onChange={e => setFormData({...formData, expected_graduation_date: e.target.value})} />
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* باقي الخطوات (2 و 3) تبقى كما هي */}
                        {step === 2 && (
                            <div className="space-y-6 animate-in slide-in-from-right-5 duration-300">
                                <div className="space-y-2">
                                    <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-2">Professional Bio</label>
                                    <textarea rows="4" className="w-full bg-slate-50 border-none rounded-[2rem] py-4 px-6 text-xs font-bold outline-none focus:ring-2 focus:ring-blue-100 resize-none" placeholder="Tell us about yourself..." value={formData.bio} onChange={e => setFormData({...formData, bio: e.target.value})}></textarea>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-2">Skills (Press Enter)</label>
                                    <div className="w-full bg-slate-50 rounded-[2rem] p-2 flex flex-wrap gap-2 min-h-[60px] border-2 border-dashed border-slate-100">
                                        {formData.skills.map((skill, i) => (
                                            <span key={i} className="bg-white px-4 py-1.5 rounded-full text-[10px] font-black text-[#00629B] shadow-sm flex items-center gap-2">
                                                {skill}
                                                <button onClick={() => setFormData({...formData, skills: formData.skills.filter((_, idx) => idx !== i)})} className="text-red-400 hover:text-red-600">×</button>
                                            </span>
                                        ))}
                                        <input className="bg-transparent border-none outline-none text-xs font-bold p-2 flex-1" placeholder="Add skill..." value={skillInput} onChange={e => setSkillInput(e.target.value)} onKeyDown={handleAddSkill} />
                                    </div>
                                </div>
                            </div>
                        )}

                        {step === 3 && (
                            <div className="space-y-6 animate-in slide-in-from-right-5 duration-300">
                                <div className="p-8 bg-blue-50/50 rounded-[2.5rem] border border-blue-100 text-center space-y-4">
                                    <Sparkles className="mx-auto text-blue-500" size={40} />
                                    <h3 className="text-lg font-black text-slate-800 tracking-tight">Ready to Join?</h3>
                                    <p className="text-[11px] font-bold text-slate-500 leading-relaxed">Your professional profile is ready. Project leaders can now see your expertise.</p>
                                </div>
                                <div className="space-y-1 px-4">
                                    <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-2">Phone Number</label>
                                    <input className="w-full bg-slate-50 border-none rounded-2xl py-4 px-6 text-xs font-bold outline-none focus:ring-2 focus:ring-blue-100" placeholder="+963..." value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
                                </div>
                            </div>
                        )}

                        {/* Navigation Buttons */}
                        <div className="flex gap-4 pt-6">
                            {step > 1 && (
                                <button type="button" onClick={handleBack} className="flex-1 py-4 bg-slate-100 text-slate-400 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2">
                                    <ChevronLeft size={16} /> Back
                                </button>
                            )}
                            {step < 3 ? (
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