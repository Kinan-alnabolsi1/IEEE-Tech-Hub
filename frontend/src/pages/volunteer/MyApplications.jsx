import React, { useState, useEffect } from 'react';
import { volunteerService } from '../../services/volunteerService';
import { 
    Rocket, 
    Clock, 
    Trophy, 
    Calendar, 
    Briefcase,
    LayoutDashboard,
    ArrowUpRight,
    FileText
} from 'lucide-react';
import Loader from '../../components/ui/Loader';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

const MyApplications = () => {
    const [journeyData, setJourneyData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('active'); 
    const navigate = useNavigate();

    useEffect(() => {
        const fetchJourney = async () => {
            try {
                setLoading(true);
                const res = await volunteerService.getMyJourney(); 
                
                // استخراج الداتا الخام
                const rawData = res.data?.data || res.data || {};
                
                // تحويل الأوبجكت لمصفوفة
                let tempArray = Array.isArray(rawData) 
                    ? rawData 
                    : Object.values(rawData);

                // تسطيح المصفوفة (Flattening)
                const finalFlatArray = tempArray.flat();

                console.log("✅ Flattened Data for UI:", finalFlatArray);
                
                // 🌟 تمرير الداتا الحقيقية فقط
                setJourneyData(finalFlatArray);

            } catch (error) {
                console.error("Fetch Journey Error:", error);
                toast.error("Failed to load your journey.");
            } finally {
                setLoading(false);
            }
        };
        fetchJourney();
    }, []);

    const safeData = Array.isArray(journeyData) ? journeyData : [];

    const categories = {
        pending: safeData.filter(item => 
            (item.application_status || item.status || '').toLowerCase() === 'pending'
        ),
        active: safeData.filter(item => 
            ((item.application_status || item.status || '').toLowerCase() === 'approved' || 
             (item.application_status || item.status || '').toLowerCase() === 'active') && 
            (item.project_status || '').toLowerCase() !== 'completed'
        ),
        completed: safeData.filter(item => 
            (item.project_status || '').toLowerCase() === 'completed'
        )
    };

    if (loading) return <Loader message="Accessing your IEEE Journey..." />;

    const JourneyCard = ({ project }) => {
        const isCompleted = (project.project_status || '').toLowerCase() === 'completed';
        
        return (
            <div 
                onClick={() => isCompleted && navigate(`/volunteer/applications/project/${project.project_id}/overview`)}
                className={`group relative bg-white rounded-[2.5rem] p-6 border border-slate-100 shadow-sm transition-all duration-500 hover:shadow-xl hover:-translate-y-1 ${isCompleted ? 'cursor-pointer hover:border-emerald-200' : ''}`}
            >
                <div className="flex justify-between items-start mb-6">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-500 ${isCompleted ? 'bg-emerald-50 text-emerald-600' : 'bg-blue-50 text-[#00629B]'}`}>
                        {isCompleted ? <Trophy size={24} /> : <Rocket size={24} />}
                    </div>
                    <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest shadow-sm ${
                        isCompleted ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
                    }`}>
                        {project.project_status || 'Ongoing'}
                    </span>
                </div>

                <div className="space-y-4">
                    <div>
                        <h3 className={`text-xl font-black uppercase italic leading-tight transition-colors ${isCompleted ? 'text-emerald-900 group-hover:text-emerald-600' : 'text-slate-800 group-hover:text-[#00629B]'}`}>
                            {project.project_title || project.title || 'Mission'}
                        </h3>
                        <div className="flex items-center gap-2 mt-2">
                            <Briefcase size={14} className="text-slate-400" />
                            <p className="text-[11px] font-bold text-[#00629B] uppercase tracking-widest">
                                {project.my_role || 'Team Member'}
                            </p>
                        </div>
                    </div>

                    <div className="h-px bg-slate-50 w-full"></div>

                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-slate-400">
                            <Calendar size={14} />
                            <span className="text-[10px] font-bold uppercase tracking-tight">
                                {project.joined_at || 'Recently'}
                            </span>
                        </div>
                        {isCompleted && (
                            <div className="bg-emerald-50 p-1.5 rounded-full">
                                <ArrowUpRight size={16} className="text-emerald-600" />
                            </div>
                        )}
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="p-4 md:p-10 animate-in fade-in duration-700 max-w-7xl mx-auto space-y-10">
            <div>
                <h1 className="text-4xl md:text-5xl font-black text-[#00629B] italic uppercase tracking-tighter">
                    My Journey
                </h1>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.4em] mt-3 ml-1 flex items-center gap-2">
                    <Trophy size={12} /> Your IEEE Contribution Journey
                </p>
            </div>

            <div className="flex flex-wrap gap-3 bg-slate-100/50 p-2 rounded-[2rem] border border-slate-200/50 w-fit">
                {['pending', 'active', 'completed'].map((tab) => (
                    <button 
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`px-8 py-3 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all flex items-center gap-2 ${
                            activeTab === tab 
                            ? (tab === 'pending' ? 'bg-white text-amber-600 shadow-md border border-amber-100' : 
                               tab === 'completed' ? 'bg-emerald-500 text-white shadow-md' : 'bg-[#00629B] text-white shadow-md') 
                            : 'text-slate-500 hover:text-slate-800'
                        }`}
                    >
                        {tab === 'pending' && <Clock size={16} />}
                        {tab === 'active' && <Rocket size={16} />}
                        {tab === 'completed' && <Trophy size={16} />}
                        {tab} ({categories[tab]?.length || 0})
                    </button>
                ))}
            </div>

            <div className="min-h-[400px]">
                {categories[activeTab]?.length === 0 ? (
                    <div className="bg-white p-20 rounded-[3rem] border border-slate-100 text-center flex flex-col items-center justify-center">
                        <FileText size={40} className="text-slate-200 mb-4" />
                        <h3 className="text-lg font-black text-slate-700 uppercase">No missions found</h3>
                        <p className="text-xs font-bold text-slate-400 mt-2">Your journey is just beginning.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pb-20">
                        {categories[activeTab].map((project, idx) => (
                            <JourneyCard key={idx} project={project} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default MyApplications;