import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Calendar, AlertCircle, ArrowLeft, ClipboardList } from 'lucide-react';
import Loader from '../../../components/ui/Loader'; 
import { taskService } from '../../../services/taskService'; // 🌟 استيراد الخدمة
import toast from 'react-hot-toast'; // 🌟 استيراد التوست للأخطاء

const TasksOverview = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const projectId = searchParams.get('project_id');
  const projectTitle = searchParams.get('title') || 'Project Tasks';

  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!projectId) {
      setLoading(false);
      return;
    }

    // 🌟 دالة جلب المهام الحقيقية من الباك إند
    const fetchTasks = async () => {
      setLoading(true);
      try {
        const response = await taskService.getProjectTasks(projectId);
        // التكيف مع شكل الاستجابة (سواء كانت داتا مباشرة أو مغلفة بـ data)
        setTasks(response.data?.data || response.data || []);
      } catch (error) {
        console.error("Error fetching tasks:", error);
        toast.error("Failed to load project tasks.");
      } finally {
        setLoading(false);
      }
    };

    fetchTasks();
  }, [projectId]);

  // دالة ألوان الأولوية
  const getPriorityColor = (priority) => {
    switch(priority?.toLowerCase()) {
      case 'critical': return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'high': return 'bg-rose-100 text-rose-700 border-rose-200';
      case 'medium': return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'low': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      default: return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  // حالة: إذا اليوزر دخل الصفحة بدون ما يختار مشروع من صفحة المشاريع
  if (!projectId && !loading) {
    return (
      <div className="flex flex-col items-center justify-center py-40 space-y-6 animate-in fade-in">
        <div className="p-6 bg-slate-50 rounded-[2rem] shadow-sm">
          <ClipboardList size={60} className="text-[#00629B]" />
        </div>
        <div className="text-center">
          <h2 className="text-2xl font-black text-slate-800 uppercase italic tracking-tighter">No Project Selected</h2>
          <p className="text-xs font-bold text-slate-400 mt-2">Please return to the Projects page and select a project to view its tasks.</p>
        </div>
        <button 
          onClick={() => navigate(-1)} 
          className="flex items-center gap-2 px-6 py-3 bg-[#00629B] text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-blue-100 hover:-translate-y-1 transition-all"
        >
          <ArrowLeft size={16} /> Back to Projects
        </button>
      </div>
    );
  }

  return (
    <>
      {loading && <Loader message={`Fetching Tasks for ${projectTitle}...`} />}

      <div className="p-4 md:p-8 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 max-w-[1600px] mx-auto">
        
        {/* Header with Back Button */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-slate-200 pb-6">
          <div>
            <div className="flex items-center gap-4 mb-2">
              <button 
                onClick={() => navigate(-1)}
                className="p-3 bg-white border border-slate-100 rounded-2xl text-slate-400 hover:text-[#00629B] hover:border-blue-100 transition-all shadow-sm"
                title="Back to Projects"
              >
                <ArrowLeft size={20} />
              </button>
              <h1 className="text-3xl md:text-4xl font-black text-[#00629B] uppercase italic tracking-tighter">
                {projectTitle}
              </h1>
            </div>
            <p className="text-[10px] text-slate-400 font-bold tracking-[0.4em] uppercase ml-14">
              Project Tasks Overview
            </p>
          </div>
        </div>

        {/* Tasks Grid */}
        {!loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {tasks.length === 0 ? (
              <div className="col-span-full py-24 text-center bg-white rounded-[2.5rem] border border-slate-50 shadow-sm">
                <p className="text-[10px] font-black text-slate-300 uppercase italic tracking-[0.4em]">
                  No tasks assigned to this project yet
                </p>
              </div>
            ) : (
              tasks.map((task) => (
                <div key={task.task_id} className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-md transition-all flex flex-col gap-5">
                  <div className="flex justify-between items-start gap-4">
                    <h3 className="text-sm font-black text-slate-800 uppercase tracking-tight leading-relaxed">
                      {task.title}
                    </h3>
                    <span className="text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full bg-slate-50 text-slate-500 shrink-0 border border-slate-100">
                      {task.status}
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <span className={`text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full border flex items-center gap-1 ${getPriorityColor(task.priority)}`}>
                      <AlertCircle size={10} /> {task.priority}
                    </span>
                    <span className="text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full bg-blue-50 text-[#00629B] border border-blue-100 flex items-center gap-1">
                      <Calendar size={10} /> {task.due_date}
                    </span>
                  </div>

                  <hr className="border-slate-50" />

                  <div className="space-y-4 flex-1">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Assignees & Progress</p>
                    {task.assignedUsers && task.assignedUsers.length > 0 ? (
                      <div className="space-y-3">
                        {task.assignedUsers.map((user) => (
                          <div key={user.user_id} className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center gap-2">
                                <div className="w-7 h-7 rounded-full bg-[#00629B] text-white flex items-center justify-center text-[10px] font-bold shadow-sm">
                                  {user.full_name?.charAt(0).toUpperCase()}
                                </div>
                                <span className="text-xs font-bold text-slate-700">{user.full_name}</span>
                              </div>
                              <span className="text-[10px] font-black text-[#00629B] bg-blue-50 px-2 py-1 rounded-lg">{user.pivot?.completion_pct || 0}%</span>
                            </div>
                            <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden mb-2">
                              <div className="bg-[#00629B] h-2 rounded-full transition-all duration-1000" style={{ width: `${user.pivot?.completion_pct || 0}%` }}></div>
                            </div>
                            {user.pivot?.progress_note && (
                              <p className="text-[10px] font-bold text-slate-500 mt-2 bg-white p-2.5 rounded-xl border border-slate-100 italic">
                                "{user.pivot.progress_note}"
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="bg-slate-50 border border-slate-100 border-dashed rounded-2xl p-4 text-center">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Unassigned Task</p>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </>
  );
};

export default TasksOverview;