import React, { useState, useEffect, useRef } from 'react';
import { chapterService } from '../../../services/chapterService';
import { ChevronDown, Check, Layout } from 'lucide-react';
import toast from 'react-hot-toast';
// 🌟 استيراد القالب الأساسي
import BaseModal from '../../../components/ui/BaseModal'; 

const ChapterModal = ({ isOpen, onClose, chapter, societies, branchId, onSuccess }) => {
  const [formData, setFormData] = useState({
    name: chapter?.name || '',
    society_id: chapter?.society_id || '',
    description: chapter?.description || '',
    status: chapter?.status || 'Active'
  });

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // إغلاق الدروب داون عند الضغط براه
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.society_id) return toast.error("Please select a parent society");
    
    try {
      if (chapter) {
        await chapterService.update(chapter.chapter_id, formData);
        toast.success("Updated Successfully");
      } else {
        await chapterService.create({ ...formData, branch_id: branchId });
        toast.success("Established Successfully");
      }
      onSuccess();
      onClose();
    } catch (err) { 
  console.error("Error submitting form:", err); // 🌟 ضفنا هاد السطر
  toast.error("Action failed"); 
}
  };

  const selectedSociety = Array.isArray(societies) 
    ? societies.find(s => String(s.society_id) === String(formData.society_id))
    : null;

  return (
    <BaseModal 
      isOpen={isOpen} 
      onClose={onClose} 
      title={chapter ? "Edit Chapter" : "New Chapter"} 
      subtitle="Configure Technical Entity Identity"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Chapter Name */}
        <div className="space-y-2">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Chapter Name</label>
          <input 
            required
            className="w-full bg-[#F8FAFC] border-2 border-transparent focus:border-blue-100 focus:bg-white rounded-[1.5rem] px-6 py-4 text-xs font-bold outline-none transition-all"
            value={formData.name}
            onChange={(e) => setFormData({...formData, name: e.target.value})}
            placeholder="Ex: Computer Society"
          />
        </div>

        {/* Custom Dropdown */}
        <div className="space-y-2" ref={dropdownRef}>
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Parent Society</label>
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className={`w-full flex items-center justify-between bg-[#F8FAFC] border-2 rounded-[1.5rem] px-6 py-4 text-xs font-bold transition-all ${isDropdownOpen ? 'border-blue-100 bg-white' : 'border-transparent'}`}
            >
              <span className={selectedSociety ? 'text-slate-800' : 'text-slate-300'}>
                {selectedSociety ? `${selectedSociety.name} (${selectedSociety.abbreviation})` : 'Select Society...'}
              </span>
              <ChevronDown className={`w-4 h-4 text-[#00629B] transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {isDropdownOpen && (
              <div className="absolute z-[100] w-full mt-2 bg-white border border-slate-100 rounded-[1.8rem] shadow-xl max-h-[200px] overflow-y-auto no-scrollbar p-2">
                {Array.isArray(societies) && societies.length > 0 ? societies.map((s) => (
                  <div
                    key={s.society_id}
                    onClick={() => {
                      setFormData({...formData, society_id: s.society_id});
                      setIsDropdownOpen(false);
                    }}
                    className={`flex items-center justify-between px-5 py-3.5 rounded-xl cursor-pointer mb-1 transition-colors ${String(formData.society_id) === String(s.society_id) ? 'bg-blue-50 text-[#00629B]' : 'hover:bg-slate-50 text-slate-600'}`}
                  >
                    <div className="flex flex-col">
                      <span className="text-[11px] font-black uppercase tracking-tight">{s.name}</span>
                      <span className="text-[9px] font-bold opacity-50 uppercase">{s.abbreviation}</span>
                    </div>
                    {String(formData.society_id) === String(s.society_id) && <Check className="w-3.5 h-3.5" />}
                  </div>
                )) : (
                  <div className="p-6 text-center text-[10px] font-bold text-slate-300 uppercase">No Societies Available</div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Description */}
        <div className="space-y-2">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Description</label>
          <textarea 
            className="w-full bg-[#F8FAFC] border-2 border-transparent focus:border-blue-100 focus:bg-white rounded-[1.5rem] px-6 py-4 text-xs font-bold outline-none transition-all min-h-[100px] resize-none"
            value={formData.description}
            onChange={(e) => setFormData({...formData, description: e.target.value})}
            placeholder="Brief info..."
          />
        </div>

        {/* Submit Button */}
        <button 
          type="submit"
          className="w-full py-5 bg-[#00629B] text-white rounded-[1.8rem] font-black text-[11px] uppercase tracking-[0.3em] shadow-lg hover:bg-[#004a75] transition-all"
        >
          {chapter ? 'Save Changes' : 'Confirm Establishment'}
        </button>
      </form>
    </BaseModal>
  );
};

export default ChapterModal;