import React, { useState, useEffect } from 'react';
import { Box, Tag, Layers, CheckCircle2, ChevronDown, AlignLeft, Activity } from 'lucide-react';
import BaseModal from '../../../../components/ui/BaseModal';

const EditSocietyModal = ({ isOpen, onClose, onEdit, societyData }) => {
  const [formData, setFormData] = useState({
    description: '',
    status: 'Active'
  });

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
      <form onSubmit={handleSubmit} className="space-y-5">
        
        {/* Read-Only Info Box */}
        <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100 space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-[10px] font-black text-slate-400 uppercase flex items-center gap-1.5"><Box className="w-3 h-3" /> Name</span>
            <span className="text-xs font-bold text-slate-700">{societyData.name}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-[10px] font-black text-slate-400 uppercase flex items-center gap-1.5"><Tag className="w-3 h-3" /> Abbreviation</span>
            <span className="text-xs font-bold text-[#00629B]">{societyData.abbreviation || societyData.abbr}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-[10px] font-black text-slate-400 uppercase flex items-center gap-1.5"><Layers className="w-3 h-3" /> Type</span>
            <span className="text-xs font-bold text-slate-700">{societyData.classification || 'Standard'}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4">
          {/* Editable Status */}
          <div className="space-y-2">
            <label className="text-[10px] font-black text-[#00629B] uppercase ml-1 flex items-center gap-2">
              <Activity className="w-3.5 h-3.5" /> Society Status
            </label>
            <div className="relative">
              <select
                className="w-full bg-white border border-slate-200 rounded-2xl px-6 py-4 text-sm font-bold outline-none focus:ring-4 focus:ring-blue-50 focus:border-[#00629B] appearance-none cursor-pointer transition-all"
                value={formData.status}
                onChange={(e) => setFormData({...formData, status: e.target.value})}
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
              <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            </div>
          </div>

          {/* Editable Description */}
          <div className="space-y-2">
            <label className="text-[10px] font-black text-[#00629B] uppercase ml-1 flex items-center gap-2">
              <AlignLeft className="w-3.5 h-3.5" /> Description
            </label>
            <textarea
              required
              rows="3"
              className="w-full bg-white border border-slate-200 rounded-2xl px-6 py-4 text-sm font-bold outline-none focus:ring-4 focus:ring-blue-50 focus:border-[#00629B] transition-all resize-none"
              placeholder="Update the description..."
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
            />
          </div>
        </div>

        <div className="pt-4 flex gap-4">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 px-6 py-4 rounded-2xl text-[10px] font-black text-slate-400 uppercase tracking-widest hover:bg-slate-50 transition-all border border-transparent hover:border-slate-100"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="flex-[2] bg-emerald-500 text-white px-6 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-emerald-500/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2"
          >
            <CheckCircle2 className="w-4 h-4" /> Save Changes
          </button>
        </div>
      </form>
    </BaseModal>
  );
};

export default EditSocietyModal;