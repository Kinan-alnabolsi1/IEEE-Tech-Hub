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

  const availableSocieties = IEEE_SOCIETIES.filter(
    (soc) => !existingSocieties.some((existing) => existing.name === soc.name)
  );

  const [formData, setFormData] = useState({
    name: '',
    abbreviation: '',
    classification: 'Technical',
    description: '' 
  });

  // 🌟 حالات فتح وإغلاق القوائم المخصصة
  const [isNameOpen, setIsNameOpen] = useState(false);
  const [isTypeOpen, setIsTypeOpen] = useState(false);

  // تعديل الدالة لتقبل القيمة مباشرة بدل الـ Event
  const handleSocietyChange = (value) => {
    const society = IEEE_SOCIETIES.find(s => s.name === value);
    if (society) {
      setFormData({ ...formData, name: society.name, abbreviation: society.abbr });
    } else {
      setFormData({ ...formData, name: value, abbreviation: '' });
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
      <form onSubmit={handleSubmit} className="space-y-4">
        
        {/* 🌟 1. Custom Dropdown - Society Name */}
        <div className="space-y-1.5 relative z-50">
          <label className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1 flex items-center gap-1.5">
            <Box className="w-3.5 h-3.5 text-[#00629B]" /> Select Society Name
          </label>
          <div className="relative">
            <button
              type="button"
              onClick={() => {
                setIsNameOpen(!isNameOpen);
                setIsTypeOpen(false); // إغلاق الثانية إذا كانت مفتوحة
              }}
              className={`w-full bg-slate-50 border-none rounded-xl px-4 py-3 text-xs font-bold outline-none focus:ring-2 focus:ring-blue-100 transition-all flex justify-between items-center ${formData.name ? 'text-slate-800' : 'text-slate-400'}`}
            >
              <span className="truncate">{formData.name || 'Choose a society...'}</span>
              <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-300 ${isNameOpen ? 'rotate-180' : ''}`} />
            </button>

            {isNameOpen && (
              <>
                <div className="fixed inset-0 z-30" onClick={() => setIsNameOpen(false)}></div>
                <div className="absolute z-40 w-full mt-2 bg-white border border-slate-100 rounded-xl shadow-[0_10px_40px_rgba(0,0,0,0.08)] py-2 max-h-48 overflow-y-auto animate-in fade-in zoom-in-95 duration-200">
                  {availableSocieties.map((soc) => (
                    <button
                      key={soc.abbr}
                      type="button"
                      onClick={() => {
                        handleSocietyChange(soc.name);
                        setIsNameOpen(false);
                      }}
                      className={`w-full text-left px-4 py-2.5 text-xs font-bold transition-colors flex items-center gap-2 hover:bg-blue-50/50 hover:text-[#00629B] ${formData.name === soc.name ? 'bg-blue-50 text-[#00629B]' : 'text-slate-600'}`}
                    >
                      {formData.name === soc.name && <div className="w-1.5 h-1.5 rounded-full bg-[#00629B]"></div>}
                      {soc.name}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => {
                      handleSocietyChange("Other");
                      setIsNameOpen(false);
                    }}
                    className={`w-full text-left px-4 py-2.5 text-xs font-bold transition-colors flex items-center gap-2 hover:bg-blue-50/50 hover:text-[#00629B] ${formData.name === 'Other' ? 'bg-blue-50 text-[#00629B]' : 'text-slate-600'}`}
                  >
                    {formData.name === 'Other' && <div className="w-1.5 h-1.5 rounded-full bg-[#00629B]"></div>}
                    Other / Custom
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1 flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5 text-[#00629B]" /> Abbreviation
            </label>
            <input
              required
              readOnly={formData.name !== "Other"}
              value={formData.abbreviation}
              className={`w-full bg-slate-50 border-none rounded-xl px-4 py-3 text-xs outline-none focus:ring-2 focus:ring-blue-100 transition-all font-bold ${
                formData.name !== "Other" ? 'text-slate-400 cursor-not-allowed opacity-70' : 'text-slate-800'
              }`}
              placeholder="Abbr."
              onChange={(e) => setFormData({...formData, abbreviation: e.target.value})}
            />
          </div>

          {/* 🌟 2. Custom Dropdown - Type */}
          <div className="space-y-1.5 relative z-40">
            <label className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-[#00629B]" /> Type
            </label>
            <div className="relative">
              <button
                type="button"
                onClick={() => {
                  setIsTypeOpen(!isTypeOpen);
                  setIsNameOpen(false); 
                }}
                className="w-full bg-slate-50 border-none rounded-xl px-4 py-3 text-xs font-bold outline-none focus:ring-2 focus:ring-blue-100 transition-all flex justify-between items-center text-slate-800"
              >
                <span className="truncate">{formData.classification}</span>
                <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-300 ${isTypeOpen ? 'rotate-180' : ''}`} />
              </button>

              {isTypeOpen && (
                <>
                  <div className="fixed inset-0 z-30" onClick={() => setIsTypeOpen(false)}></div>
                  <div className="absolute z-40 w-full mt-2 bg-white border border-slate-100 rounded-xl shadow-[0_10px_40px_rgba(0,0,0,0.08)] py-2 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                    {['Technical', 'Affinity Group', 'Administrative'].map((type) => (
                      <button
                        key={type}
                        type="button"
                        onClick={() => {
                          setFormData({ ...formData, classification: type });
                          setIsTypeOpen(false);
                        }}
                        className={`w-full text-left px-4 py-2.5 text-xs font-bold transition-colors flex items-center gap-2 hover:bg-blue-50/50 hover:text-[#00629B] ${formData.classification === type ? 'bg-blue-50 text-[#00629B]' : 'text-slate-600'}`}
                      >
                        {formData.classification === type && <div className="w-1.5 h-1.5 rounded-full bg-[#00629B]"></div>}
                        {type}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Description Field */}
        <div className="space-y-1.5">
          <label className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1 flex items-center gap-1.5">
            <AlignLeft className="w-3.5 h-3.5 text-[#00629B]" /> Description
          </label>
          <textarea
            required
            rows="3"
            className="w-full bg-slate-50 border-none rounded-xl px-4 py-3 text-xs outline-none focus:ring-2 focus:ring-blue-100 transition-all font-bold text-slate-800 resize-none"
            placeholder="Briefly describe the society's purpose..."
            value={formData.description}
            onChange={(e) => setFormData({...formData, description: e.target.value})}
          />
        </div>

        <div className="pt-4 flex gap-4">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 px-4 py-3.5 rounded-xl text-[10px] font-black text-slate-400 uppercase tracking-widest hover:bg-slate-50 transition-all border border-transparent hover:border-slate-100"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="flex-[2] bg-[#00629B] text-white px-4 py-3.5 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg hover:shadow-blue-200 hover:bg-[#005282] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
          >
            <CheckCircle2 className="w-4 h-4" /> Add Society
          </button>
        </div>
      </form>
    </BaseModal>
  );
};

export default AddSocietyModal;