import React, { useState } from 'react';
import { X, Box, Tag, Layers, CheckCircle2 } from 'lucide-react';

const AddSocietyModal = ({ isOpen, onClose, onAdd }) => {
  const [formData, setFormData] = useState({
    name: '',
    abbreviation: '',
    classification: 'Technical' // Default value
  });

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onAdd(formData);
    setFormData({ name: '', abbreviation: '', classification: 'Technical' });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300" onClick={onClose} />

      <div className="relative bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl p-10 animate-in zoom-in-95 duration-300">
        <div className="flex justify-between items-center mb-10">
          <div>
            <h2 className="text-2xl font-black text-[#00629B] uppercase tracking-tight italic">New Society</h2>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.3em] mt-1">Technical Definition</p>
          </div>
          <button onClick={onClose} className="p-3 hover:bg-slate-50 rounded-2xl transition-colors text-slate-300">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Society Name */}
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase ml-1 flex items-center gap-2">
              <Box className="w-3 h-3" /> Full Society Name
            </label>
            <input
              required
              className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 text-sm font-bold outline-none focus:ring-4 focus:ring-blue-50 transition-all shadow-sm"
              placeholder="e.g. Computer Society"
              onChange={(e) => setFormData({...formData, name: e.target.value})}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Abbreviation */}
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase ml-1 flex items-center gap-2">
                <Tag className="w-3 h-3" /> Abbreviation
              </label>
              <input
                required
                className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 text-sm font-bold outline-none focus:ring-4 focus:ring-blue-50 transition-all uppercase shadow-sm"
                placeholder="CS"
                onChange={(e) => setFormData({...formData, abbreviation: e.target.value})}
              />
            </div>
            {/* Classification */}
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase ml-1 flex items-center gap-2">
                <Layers className="w-3 h-3" /> Classification
              </label>
              <select
                className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 text-sm font-bold outline-none focus:ring-4 focus:ring-blue-50 transition-all cursor-pointer shadow-sm"
                onChange={(e) => setFormData({...formData, classification: e.target.value})}
              >
                <option value="Technical">Technical</option>
                <option value="Affinity Group">Affinity Group</option>
                <option value="Non-Technical">Non-Technical</option>
              </select>
            </div>
          </div>

          <div className="pt-6 flex gap-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-4 rounded-2xl text-[10px] font-black text-slate-400 uppercase tracking-widest hover:bg-slate-50 transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-[2] bg-[#00629B] text-white px-6 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-blue-900/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4" /> Save Society
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddSocietyModal;