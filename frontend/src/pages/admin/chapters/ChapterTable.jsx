import React from 'react';
import { 
  Edit2, Trash2, Users, UserPlus, 
  ToggleLeft, ToggleRight, Layout, Info 
} from 'lucide-react';
// 🌟 تأكدي من صحة مسار الـ EmptyState حسب الستراكتشر عندك
import EmptyState from '@/components/ui/EmptyState'; 

const ChapterTable = ({ chapters, onEdit, onDelete, onToggleStatus, onManageMembers }) => {

  // 🌟 حماية أولى: التأكد أن chapters مصفوفة ولها طول، وإلا عرض الـ Empty State
  if (!Array.isArray(chapters) || chapters.length === 0) {
    return (
      <EmptyState 
        icon={Layout} 
        title="No Chapters Established" 
        message="Your branch directory is currently empty. Click 'Establish New Chapter' to start building your technical entities."
      />
    );
  }

  return (
    <div className="bg-white rounded-[2.5rem] shadow-[0_20px_60px_rgba(0,0,0,0.02)] border border-slate-100 overflow-x-auto no-scrollbar">
      <table className="w-full text-left border-separate border-spacing-0 min-w-[1000px]">
        <thead>
          <tr className="bg-slate-50/50">
            <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] border-b border-slate-100">Chapter Identity</th>
            <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] border-b border-slate-100">Parent Society</th>
            <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] border-b border-slate-100">Chapter Chair</th>
            <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] border-b border-slate-100 text-center">Status</th>
            <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] border-b border-slate-100 text-right pr-12">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-50">
          {/* 🌟 حماية ثانية: استخدام && لضمان أننا لن نقوم بعمل map على شيء ليس مصفوفة */}
          {Array.isArray(chapters) && chapters.map((chapter) => {
            const isActive = chapter.status?.toLowerCase() === 'active';
            const chapterId = chapter.chapter_id || chapter.id;
            
            return (
              <tr
                key={chapterId || Math.random()}
                className="hover:bg-blue-50/30 transition-all duration-300 group"
              >
                {/* اسم الفصل */}
                <td className="px-8 py-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center text-[#00629B] font-black text-sm border border-blue-100/50 group-hover:scale-110 transition-transform">
                      {chapter.name?.charAt(0) || "C"}
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm font-black text-slate-800 italic uppercase tracking-tight">
                        {chapter.name || "Unnamed Chapter"}
                      </span>
                      <div className="flex items-center gap-1 mt-0.5">
                        <Info className="w-3 h-3 text-slate-300" />
                        <span className="text-[9px] text-slate-400 font-bold uppercase tracking-widest leading-none">
                          Technical Chapter
                        </span>
                      </div>
                    </div>
                  </div>
                </td>

                {/* الجمعية التابع لها */}
                <td className="px-6 py-6">
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-slate-100 rounded-xl border border-slate-200/50">
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-wider">
                      {chapter.society?.abbreviation ||
                        chapter.society?.name ||
                        "IEEE SOCIETY"}
                    </span>
                  </div>
                </td>

                {/* رئيس الفصل (Chair) */}
                <td className="px-6 py-6">
                  {chapter.chair ? (
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-[#00629B] text-white flex items-center justify-center font-black text-[10px] shadow-lg shadow-blue-900/10 uppercase border-2 border-white">
                        {(
                          chapter.chair.full_name || chapter.chair.name
                        )?.charAt(0)}
                      </div>
                      <div className="flex flex-col">
                        <span className="text-xs font-black text-slate-700 capitalize">
                          {chapter.chair.full_name || chapter.chair.name}
                        </span>
                        <span className="text-[9px] text-slate-400 font-bold italic">
                          Chapter Lead
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-slate-300 italic">
                      <UserPlus className="w-4 h-4 opacity-30" />
                      <span className="text-[10px] font-bold uppercase tracking-tighter">
                        No Chair Assigned
                      </span>
                    </div>
                  )}
                </td>

                {/* الحالة (Toggle) */}
                <td className="px-6 py-6 text-center">
                  <button
                    onClick={() => onToggleStatus && onToggleStatus(chapter)}
                    className="focus:outline-none transition-transform active:scale-90"
                    title={isActive ? "Deactivate Chapter" : "Activate Chapter"}
                  >
                    {isActive ? (
                      <ToggleRight className="w-7 h-7 text-emerald-500 drop-shadow-sm" />
                    ) : (
                      <ToggleLeft className="w-7 h-7 text-slate-200" />
                    )}
                  </button>
                </td>

                {/* الأكشنز */}
                <td className="px-8 py-6">
                  <div className="flex justify-end items-center gap-3">
                    {/* إدارة الأعضاء */}
                    <button
                      onClick={() =>
                        onManageMembers && onManageMembers(chapter)
                      }
                      className="p-3 bg-white text-slate-400 hover:text-[#00629B] hover:bg-blue-50 border border-slate-100 rounded-2xl transition-all shadow-sm group/btn"
                      title="Manage Members"
                    >
                      <Users className="w-4 h-4 group-hover/btn:scale-110 transition-transform" />
                    </button>

                    {/* تعديل */}
                    <button
                      onClick={() => onEdit && onEdit(chapter)}
                      className="p-3 bg-white text-slate-400 hover:text-amber-500 hover:bg-amber-50 border border-slate-100 rounded-2xl transition-all shadow-sm"
                      title="Edit Settings"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>

                    {/* حذف */}
                    <button
                      onClick={() => onDelete(chapter.chapter_id)}
                      className="p-3 bg-white text-slate-400 hover:text-red-500 hover:bg-red-50 border border-slate-100 rounded-2xl transition-all shadow-sm"
                      title="Delete Chapter"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default ChapterTable;