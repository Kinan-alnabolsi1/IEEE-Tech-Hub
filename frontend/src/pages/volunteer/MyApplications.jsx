import React, { useState, useEffect } from 'react';
import { volunteerService } from '../../services/volunteerService';
import { LayoutGrid, Hourglass, CheckCircle2, XCircle, ShieldCheck, Briefcase } from 'lucide-react';

const MyApplications = () => {
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchMyProjects = async () => {
        try {
            setLoading(true);
            const response = await volunteerService.getMyProjects();
            setApplications(response.data?.data || response.data || []);
        } catch (error) {
            console.error("Error fetching apps");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchMyProjects(); }, []);

    const getStatusStyle = (status) => {
        switch(status?.toLowerCase()) {
            case 'approved': return 'bg-emerald-50 text-emerald-600 border-emerald-100';
            case 'pending': return 'bg-amber-50 text-amber-600 border-amber-100';
            case 'rejected': return 'bg-rose-50 text-rose-600 border-rose-100';
            default: return 'bg-slate-50 text-slate-500 border-slate-100';
        }
    };

    return (
        <div className="p-4 md:p-10 animate-in fade-in duration-700">
            <div className="mb-12">
                <h1 className="text-4xl font-[900] text-[#00629B] italic uppercase tracking-tight">My Journey</h1>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.4em] mt-3 flex items-center gap-2">
                    <Briefcase size={14} /> Tracking your project applications
                </p>
            </div>

            <div className="grid grid-cols-1 gap-6">
                {applications.length === 0 ? (
                    <div className="bg-white rounded-[3rem] p-20 text-center border border-slate-100 italic font-bold text-slate-300 uppercase tracking-widest">
                        You haven't applied to any projects yet.
                    </div>
                ) : (
                    applications.map((app) => (
                        <div key={app.id} className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6 hover:shadow-md transition-all">
                            <div className="flex items-center gap-6 flex-1">
                                <div className="w-16 h-16 bg-blue-50 rounded-[1.5rem] flex items-center justify-center text-[#00629B] shrink-0">
                                    <LayoutGrid size={24} />
                                </div>
                                <div>
                                    <h3 className="text-lg font-black text-slate-800 uppercase italic tracking-tight">{app.name}</h3>
                                    <div className="flex items-center gap-2 mt-1">
                                        <ShieldCheck size={12} className="text-slate-400" />
                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Role Applied: {app.pivot?.role}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-4 w-full md:w-auto">
                                <div className={`px-6 py-3 rounded-2xl border text-[10px] font-black uppercase tracking-widest flex items-center gap-2 ${getStatusStyle(app.pivot?.status)}`}>
                                    {app.pivot?.status?.toLowerCase() === 'pending' && <Hourglass size={14} className="animate-spin-slow" />}
                                    {app.pivot?.status?.toLowerCase() === 'approved' && <CheckCircle2 size={14} />}
                                    {app.pivot?.status}
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default MyApplications;