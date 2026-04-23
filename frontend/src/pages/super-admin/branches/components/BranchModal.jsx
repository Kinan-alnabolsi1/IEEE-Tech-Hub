import React, { useState, useEffect } from 'react';
import BaseModal from '@/components/ui/BaseModal';
import { Building2, MapPin, Mail, Phone, Calendar, AlignLeft } from 'lucide-react';

const BranchModal = ({ isOpen, onClose, onSave, initialData }) => {
  const [formData, setFormData] = useState({ 
    name: '', region: '', description: '', contact_email: '', contact_phone: '', founded_date: '' 
  });

useEffect(() => {
    if (initialData && isOpen) {
      setFormData({
        name: initialData.name || '',
        region: initialData.region || '',
        description: initialData.description || '',
        contact_email: initialData.contact_email || '',
        contact_phone: initialData.contact_phone || '',
        founded_date: initialData.founded_date ? initialData.founded_date.split('T')[0] : '' 
      });
    } else {
      setFormData({ name: '', region: '', description: '', contact_email: '', contact_phone: '', founded_date: '' });
    }
    
    // 🌟 هاد السطر السحري اللي بيطفي الخط الأحمر المزعج
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialData, isOpen]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <BaseModal isOpen={isOpen} onClose={onClose} title={initialData ? "Edit Infrastructure" : "New Integration"}>
      <form onSubmit={handleSubmit} className="space-y-4 mt-2">
        
        {/* Branch Identity */}
        <div className="space-y-1">
          <label className="text-[9px] font-black uppercase tracking-[0.2em] text-[#00629B] ml-2 block">Branch Identity <span className="text-red-400">*</span></label>
          <div className="relative">
            <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
            <input 
              name="name" required type="text" placeholder="e.g. IEEE Damascus University"
              className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-3.5 pl-12 pr-4 text-xs font-bold outline-none focus:border-[#00629B] transition-all" 
              value={formData.name} onChange={handleInputChange} 
            />
          </div>
        </div>

        {/* 🌟 Responsive Grid: عمودي عالموبايل، افقي عالشاشات */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[9px] font-black uppercase tracking-[0.2em] text-[#00629B] ml-2 block">Location <span className="text-red-400">*</span></label>
              <div className="relative">
                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                <input 
                  name="region" required type="text" placeholder="e.g. Damascus"
                  className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-3.5 pl-12 pr-4 text-xs font-bold outline-none focus:border-[#00629B] transition-all" 
                  value={formData.region} onChange={handleInputChange} 
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[9px] font-black uppercase tracking-[0.2em] text-[#00629B] ml-2 block">Founded Date</label>
              <div className="relative">
                <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                <input 
                  name="founded_date" type="date" 
                  className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-3.5 pl-12 pr-4 text-xs font-bold text-slate-600 outline-none focus:border-[#00629B] transition-all" 
                  value={formData.founded_date} onChange={handleInputChange} 
                />
              </div>
            </div>
        </div>

        {/* 🌟 Responsive Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[9px] font-black uppercase tracking-[0.2em] text-[#00629B] ml-2 block">Contact Email</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                <input 
                  name="contact_email" type="email" placeholder="branch@ieee.org"
                  className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-3.5 pl-12 pr-4 text-xs font-bold outline-none focus:border-[#00629B] transition-all" 
                  value={formData.contact_email} onChange={handleInputChange} 
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[9px] font-black uppercase tracking-[0.2em] text-[#00629B] ml-2 block">Contact Phone</label>
              <div className="relative">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                <input 
                  name="contact_phone" type="tel" placeholder="+963..."
                  className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-3.5 pl-12 pr-4 text-xs font-bold outline-none focus:border-[#00629B] transition-all" 
                  value={formData.contact_phone} onChange={handleInputChange} 
                />
              </div>
            </div>
        </div>

        {/* Description */}
        <div className="space-y-1">
          <label className="text-[9px] font-black uppercase tracking-[0.2em] text-[#00629B] ml-2 block">Description</label>
          <div className="relative">
            <AlignLeft className="absolute left-4 top-4 w-4 h-4 text-slate-300" />
            <textarea 
              name="description" rows="3" placeholder="Brief overview of the branch..."
              className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-3.5 pl-12 pr-4 text-xs font-bold outline-none focus:border-[#00629B] transition-all resize-none" 
              value={formData.description} onChange={handleInputChange} 
            />
          </div>
        </div>

        {/* Actions */}
        <div className="pt-4 flex gap-3">
          <button type="button" onClick={onClose} className="flex-1 py-4 text-[9px] font-black uppercase tracking-widest text-slate-400 border border-slate-100 rounded-2xl hover:bg-slate-50 transition-colors">Abort</button>
          <button type="submit" className="flex-1 bg-[#00629B] text-white py-4 text-[9px] font-black uppercase tracking-widest rounded-2xl shadow-xl shadow-blue-900/20 active:scale-95 transition-all">
            {initialData ? "Apply Changes" : "Execute Integration"}
          </button>
        </div>
      </form>
    </BaseModal>
  );
};

export default BranchModal;