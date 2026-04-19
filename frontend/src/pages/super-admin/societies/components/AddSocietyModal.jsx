import React, { useState } from 'react';
import { Box, Tag, Layers, CheckCircle2, ChevronDown, AlignLeft } from 'lucide-react';
import BaseModal from '../../../../components/ui/BaseModal';

const AddSocietyModal = ({ isOpen, onClose, onAdd, existingSocieties = [] }) => {
  const IEEE_SOCIETIES = [
    { name: "Computer Society", abbr: "CS" },
    { name: "Communications Society", abbr: "ComSoc" },
    { name: "Power & Energy Society", abbr: "PES" },
    { name: "Robotics and Automation Society", abbr: "RAS" },
    { name: "Signal Processing Society", abbr: "SPS" },
    { name: "Women in Engineering", abbr: "WIE" },
    { name: "Young Professionals", abbr: "YP" },
    { name: "Educational Activities Board", abbr: "EAB" }
  ];

  // Dynamic Filtering: Remove societies that are already added
  const availableSocieties = IEEE_SOCIETIES.filter(
    (soc) => !existingSocieties.some((existing) => existing.name === soc.name)
  );

  const [formData, setFormData] = useState({
    name: '',
    abbreviation: '',
    classification: 'Technical',
    description: '' // الحقل الجديد
  });

  const handleSocietyChange = (e) => {
    const selectedName = e.target.value;
    const society = IEEE_SOCIETIES.find(s => s.name === selectedName);
    
    if (society) {
      setFormData({
        ...formData,
        name: society.name,
        abbreviation: society.abbr
      });
    } else {
      setFormData({ ...formData, name: selectedName, abbreviation: '' });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onAdd(formData);
    setFormData({ name: '', abbreviation: '', classification: 'Technical', description: '' });
  };

  return (
    <BaseModal 
      isOpen={isOpen} 
      onClose={onClose} 
      title="Create New Society" 
      subtitle="Select society from the official global list"
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        
        {/* Dropdown */}
        <div className="space-y-2">
          <label className="text-[10px] font-black text-[#00629B] uppercase ml-1 flex items-center gap-2">
            <Box className="w-3.5 h-3.5" /> Select Society Name
          </label>
          <div className="relative">
            <select
              required
              value={formData.name}
              onChange={handleSocietyChange}
              className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 text-sm font-bold outline-none focus:ring-4 focus:ring-blue-50 focus:border-[#00629B] transition-all appearance-none cursor-pointer"
            >
              <option value="" disabled>Choose a society...</option>
              {availableSocieties.map((soc) => (
                <option key={soc.abbr} value={soc.name}>{soc.name}</option>
              ))}
              <option value="Other">Other / Custom</option>
            </select>
            <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-[#00629B] uppercase ml-1 flex items-center gap-2">
              <Tag className="w-3.5 h-3.5" /> Abbreviation
            </label>
            <input
              required
              readOnly={formData.name !== "Other"}
              value={formData.abbreviation}
              className={`w-full border rounded-2xl px-6 py-4 text-sm font-bold outline-none transition-all ${
                formData.name !== "Other" ? 'bg-slate-100 border-transparent text-slate-500 cursor-not-allowed' : 'bg-slate-50 border-slate-100 focus:border-[#00629B]'
              }`}
              placeholder="Abbr."
              onChange={(e) => setFormData({...formData, abbreviation: e.target.value})}
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-[#00629B] uppercase ml-1 flex items-center gap-2">
              <Layers className="w-3.5 h-3.5" /> Type
            </label>
            <div className="relative">
              <select
                className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 text-sm font-bold outline-none focus:ring-4 focus:ring-blue-50 appearance-none cursor-pointer"
                value={formData.classification}
                onChange={(e) => setFormData({...formData, classification: e.target.value})}
              >
                <option value="Technical">Technical</option>
                <option value="Affinity Group">Affinity Group</option>
                <option value="Administrative">Administrative</option>
              </select>
              <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Description Field */}
        <div className="space-y-2">
          <label className="text-[10px] font-black text-[#00629B] uppercase ml-1 flex items-center gap-2">
            <AlignLeft className="w-3.5 h-3.5" /> Description
          </label>
          <textarea
            required
            rows="3"
            className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 text-sm font-bold outline-none focus:ring-4 focus:ring-blue-50 focus:border-[#00629B] transition-all resize-none"
            placeholder="Briefly describe the society's purpose..."
            value={formData.description}
            onChange={(e) => setFormData({...formData, description: e.target.value})}
          />
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
            className="flex-[2] bg-[#00629B] text-white px-6 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-blue-900/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2"
          >
            <CheckCircle2 className="w-4 h-4" /> Add Society
          </button>
        </div>
      </form>
    </BaseModal>
  );
};

export default AddSocietyModal;