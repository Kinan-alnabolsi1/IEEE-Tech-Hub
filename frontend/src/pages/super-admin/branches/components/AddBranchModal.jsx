import React, { useState } from 'react';
import { X, ChevronDown } from 'lucide-react';

const AddBranchModal = ({ isOpen, onClose, onAdd, users }) => {
  const [formData, setFormData] = useState({
    name: '',
    region: '',
    manager: '',
    established_at: ''
  });

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if(!formData.manager) return alert("Please select a manager");
    onAdd(formData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onClose} />

      <div className="relative bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl p-8 animate-in zoom-in-95 duration-200">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-black text-[#00629B] uppercase tracking-tight italic">New Branch</h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-50 rounded-xl text-slate-400 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Branch Name */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Branch Name</label>
            <input
              required
              className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-3.5 text-sm font-bold outline-none focus:ring-4 focus:ring-blue-50 focus:bg-white transition-all"
              placeholder="Enter branch name..."
              onChange={(e) => setFormData({...formData, name: e.target.value})}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Region */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Region</label>
              <input
                required
                className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-3.5 text-sm font-bold outline-none focus:ring-4 focus:ring-blue-50 focus:bg-white transition-all"
                placeholder="City"
                onChange={(e) => setFormData({...formData, region: e.target.value})}
              />
            </div>
            {/* Date */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Established</label>
              <input
                required
                type="date"
                className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-3.5 text-sm font-bold outline-none focus:ring-4 focus:ring-blue-50 focus:bg-white transition-all"
                onChange={(e) => setFormData({...formData, established_at: e.target.value})}
              />
            </div>
          </div>

          {/* Select Manager - اختيار المدير من قائمة */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Assign Manager</label>
            <div className="relative">
              <select
                required
                className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-3.5 text-sm font-bold outline-none focus:ring-4 focus:ring-blue-50 focus:bg-white transition-all appearance-none cursor-pointer"
                onChange={(e) => setFormData({...formData, manager: e.target.value})}
                defaultValue=""
              >
                <option value="" disabled>Select from users...</option>
                {users.map(user => (
                  <option key={user.id} value={user.name}>{user.name}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-[#00629B] text-white py-4 rounded-[1.5rem] text-xs font-black uppercase tracking-widest shadow-lg shadow-blue-900/20 hover:scale-[1.01] active:scale-95 transition-all mt-4"
          >
            Create Branch Now
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddBranchModal;