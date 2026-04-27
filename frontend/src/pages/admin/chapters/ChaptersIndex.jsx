import React, { useState, useEffect } from 'react';
import { chapterService } from '../../../services/chapterService';
import { societyService } from '../../../services/societyService';
import { Plus, Layout } from 'lucide-react';
import ChapterTable from './ChapterTable';
import ChapterModal from './ChapterModal';
import MemberManagementModal from './MemberManagementModal'; // 🌟 استيراد المودال الجديد
import toast from 'react-hot-toast';
import Loader from '../../../components/ui/Loader'; 

const ChaptersIndex = () => {
  const [chapters, setChapters] = useState([]);
  const [societies, setSocieties] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // حالات المودالات
  const [isModalOpen, setIsModalOpen] = useState(false); // مودال الإضافة والتعديل
  const [isMembersModalOpen, setIsMembersModalOpen] = useState(false); // 🌟 مودال إدارة الأعضاء
  const [selectedChapter, setSelectedChapter] = useState(null);

  const branchId = localStorage.getItem('branch_id');

  const fetchData = async () => {
    try {
      setLoading(true);
      const [chaptersRes, societiesRes] = await Promise.all([
        chapterService.getByBranch(branchId),
        societyService.getAll('Active')
      ]);
      
      setChapters(chaptersRes.data?.data || chaptersRes.data || []);
      setSocieties(societiesRes.data?.data || societiesRes.data || []);

    } catch (err) {
      console.error(err);
      toast.error("Error syncing data");
    } finally {
      setLoading(false);
    }
  };

  // دالة تبديل الحالة (Active/Inactive)
  const handleToggleStatus = async (chapter) => {
    const newStatus = chapter.status === 'Active' ? 'Inactive' : 'Active';
    try {
      await chapterService.update(chapter.chapter_id, { status: newStatus });
      setChapters(prev => prev.map(c => 
        c.chapter_id === chapter.chapter_id ? { ...c, status: newStatus } : c
      ));
      toast.success(`Chapter is now ${newStatus}`);
    } catch (err) {
      console.error(err);
      toast.error("Failed to update status");
    }
  };
  
  const handleDelete = async (chapterId) => {
    try {
      await chapterService.delete(chapterId);
      toast.success("Chapter deleted successfully");
      fetchData(); // 🔥 إعادة تحميل البيانات بعد الحذف
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete chapter");
    }
  };

  useEffect(() => { if (branchId) fetchData(); }, [branchId]);

  return (
    <>
      {loading && <Loader message="Loading Chapters..." />}

      <div className="p-4 md:p-8 space-y-10 animate-in fade-in duration-700 max-w-[1600px] mx-auto">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div>
            <h1 className="text-3xl md:text-4xl font-black text-[#00629B] uppercase italic tracking-tighter">
              Chapters Management
            </h1>
            <p className="text-[10px] text-slate-400 font-bold tracking-[0.4em] uppercase mt-1">
              Establish & Organize Technical Entities
            </p>
          </div>

          <button
            onClick={() => {
              setSelectedChapter(null);
              setIsModalOpen(true);
            }}
            className="w-full sm:w-auto flex items-center justify-center gap-3 px-8 py-4 bg-[#00629B] text-white rounded-[1.5rem] md:rounded-[2rem] font-black text-[11px] uppercase tracking-[0.2em] shadow-lg hover:bg-[#004a75] transition-all active:scale-95"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            Establish New Chapter
          </button>
        </div>

        {/* Table Section */}
        {!loading && (
          <div className="w-full">
            <ChapterTable
              chapters={chapters}
              onEdit={(c) => {
                setSelectedChapter(c);
                setIsModalOpen(true);
              }}
              onDelete={handleDelete}
              onToggleStatus={handleToggleStatus}
              // 🌟 ربط زر إدارة الأعضاء بفتح المودال الجديد
              onManageMembers={(c) => {
                setSelectedChapter(c);
                setIsMembersModalOpen(true);
              }}
            />
          </div>
        )}

        {/* 1. مودال إضافة/تعديل الفصل */}
        {isModalOpen && (
          <ChapterModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            chapter={selectedChapter}
            societies={societies}
            branchId={branchId}
            onSuccess={fetchData}
          />
        )}

        {/* 🌟 2. مودال إدارة أعضاء الفصل الجديد */}
        {isMembersModalOpen && (
          <MemberManagementModal
            isOpen={isMembersModalOpen}
            onClose={() => setIsMembersModalOpen(false)}
            chapter={selectedChapter}
            onSuccess={fetchData}
          />
        )}
      </div>
    </>
  );
};

export default ChaptersIndex;