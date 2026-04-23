import React, { useState, useEffect } from 'react';
import { Box, Tag, Layers, CheckCircle2, ChevronDown, AlignLeft, Activity } from 'lucide-react';
import BaseModal from '../../../../components/ui/BaseModal';

const EditSocietyModal = ({ isOpen, onClose, onEdit, societyData }) => {
  const [formData, setFormData] = useState({
    description: '',
    status: 'Active'
  });

  // 🌟 حالة لفتح وإغلاق القائمة المخصصة
  const [isStatusOpen, setIsStatusOpen] = useState(false);

  // Populate data when modal opens
  useEffect(() => {
    if (societyData) {
      setFormData({
        description: societyData.description || '',
        status: societyData.status || 'Active'
      });
    }
  }, [societyData]);

  if (!societyData) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onEdit(societyData.id || societyData.society_id, formData);
  };

  return (
    <BaseModal 
      isOpen={isOpen} 
      onClose={onClose} 
      title="Edit Society Details" 
      subtitle={`Updating settings for ${societyData.abbreviation}`}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        
        {/* Read-Only Info Box */}
        <div className="p-5 bg-slate-50 rounded-xl border border-slate-100 space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-[10px] font-black text-slate-400 uppercase flex items-center gap-1.5"><Box className="w-3.5 h-3.5 text-[#00629B]" /> Name</span>
            <span className="text-xs font-bold text-slate-800">{societyData.name}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-[10px] font-black text-slate-400 uppercase flex items-center gap-1.5"><Tag className="w-3.5 h-3.5 text-[#00629B]" /> Abbreviation</span>
            <span className="text-xs font-black text-[#00629B] bg-blue-50 px-2 py-0.5 rounded-md">{societyData.abbreviation || societyData.abbr}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-[10px] font-black text-slate-400 uppercase flex items-center gap-1.5"><Layers className="w-3.5 h-3.5 text-[#00629B]" /> Type</span>
            <span className="text-xs font-bold text-slate-600">{societyData.classification || 'Standard'}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4">
          
          {/* 🌟 Custom Dropdown - Editable Status */}
          <div className="space-y-1.5 relative z-50">
            <label className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1 flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-[#00629B]" /> Society Status
            </label>
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsStatusOpen(!isStatusOpen)}
                className="w-full bg-slate-50 border-none rounded-xl px-4 py-3 text-xs font-bold outline-none focus:ring-2 focus:ring-blue-100 transition-all flex justify-between items-center text-slate-800"
              >
                <span className="truncate">{formData.status}</span>
                <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-300 ${isStatusOpen ? 'rotate-180' : ''}`} />
              </button>

              {isStatusOpen && (
                <>
                  <div className="fixed inset-0 z-30" onClick={() => setIsStatusOpen(false)}></div>
                  <div className="absolute z-40 w-full mt-2 bg-white border border-slate-100 rounded-xl shadow-[0_10px_40px_rgba(0,0,0,0.08)] py-2 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                    {['Active', 'Inactive'].map((statusOption) => (
                      <button
                        key={statusOption}
                        type="button"
                        onClick={() => {
                          setFormData({ ...formData, status: statusOption });
                          setIsStatusOpen(false);
                        }}
                        className={`w-full text-left px-4 py-2.5 text-xs font-bold transition-colors flex items-center gap-2 hover:bg-blue-50/50 hover:text-[#00629B] ${formData.status === statusOption ? 'bg-blue-50 text-[#00629B]' : 'text-slate-600'}`}
                      >
                        {formData.status === statusOption && <div className="w-1.5 h-1.5 rounded-full bg-[#00629B]"></div>}
                        <span className={statusOption === 'Active' ? 'text-emerald-600' : 'text-red-500'}>
                           {statusOption}
                        </span>
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Editable Description */}
          <div className="space-y-1.5 relative z-40">
            <label className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1 flex items-center gap-1.5">
              <AlignLeft className="w-3.5 h-3.5 text-[#00629B]" /> Description
            </label>
            <textarea
              required
              rows="3"
              className="w-full bg-slate-50 border-none rounded-xl px-4 py-3 text-xs font-bold text-slate-800 outline-none focus:ring-2 focus:ring-blue-100 transition-all resize-none"
              placeholder="Update the description..."
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
            />
          </div>
        </div>

        <div className="pt-4 flex gap-4 relative z-30">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 px-4 py-3.5 rounded-xl text-[10px] font-black text-slate-400 uppercase tracking-widest hover:bg-slate-50 transition-all border border-transparent hover:border-slate-100"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="flex-[2] bg-emerald-500 text-white px-4 py-3.5 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg hover:shadow-emerald-200 hover:bg-emerald-600 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
          >
            <CheckCircle2 className="w-4 h-4" /> Save Changes
          </button>
        </div>
      </form>
    </BaseModal>
  );
};

export default EditSocietyModal;