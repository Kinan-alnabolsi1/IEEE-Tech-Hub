import React, { useState, useEffect } from 'react';
import BaseModal from '@/components/ui/BaseModal';
import { Building2, MapPin, User } from 'lucide-react';

const BranchModal = ({ isOpen, onClose, onSave, initialData, users }) => {
  const [formData, setFormData] = useState({ 
    name: '', 
    region: '', 
    admin_id: '', 
    description: '' 
  });

  useEffect(() => {
    if (initialData && isOpen) {
      // تعديل هنا لضمان التقاط الـ ID الصحيح مهما كان مسمى الحقل القادم من السيرفر
      const currentAdminId = initialData.admin?.id || initialData.admin_id || initialData.user_id || '';
      
      setFormData({
        name: initialData.name || '',
        region: initialData.region || '',
        admin_id: String(currentAdminId), // تحويل لنص ليتوافق مع الـ select
        description: initialData.description || ''
      });
    } else {
      setFormData({ name: '', region: '', admin_id: '', description: '' });
    }
  }, [initialData, isOpen]);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // التأكد من أن القيمة رقمية قبل الإرسال
    const selectedAdminId = parseInt(formData.admin_id, 10);

    if (!selectedAdminId || isNaN(selectedAdminId)) {
        alert("Please select a valid manager");
        return;
    }

    const payload = {
      name: formData.name.trim(),
      region: formData.region.trim(),
      description: formData.description || "IEEE Branch",
      admin_id: selectedAdminId
    };

    onSave(payload);
  };

  return (
    <BaseModal isOpen={isOpen} onClose={onClose} title={initialData ? "Edit Infrastructure" : "New Integration"}>
      <form onSubmit={handleSubmit} className="space-y-5">
        
        {/* Branch Name */}
        <div className="space-y-1">
          <label className="text-[9px] font-black uppercase tracking-[0.2em] text-[#00629B] ml-2 block">Branch Identity</label>
          <div className="relative">
            <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
            <input 
              required 
              type="text" 
              className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 pl-12 pr-4 text-xs font-bold outline-none focus:border-[#00629B] transition-all" 
              value={formData.name} 
              onChange={(e) => setFormData({...formData, name: e.target.value})} 
            />
          </div>
        </div>

        {/* Region */}
        <div className="space-y-1">
          <label className="text-[9px] font-black uppercase tracking-[0.2em] text-[#00629B] ml-2 block">Location Vector</label>
          <div className="relative">
            <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
            <input 
              required 
              type="text" 
              className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 pl-12 pr-4 text-xs font-bold outline-none focus:border-[#00629B] transition-all" 
              value={formData.region} 
              onChange={(e) => setFormData({...formData, region: e.target.value})} 
            />
          </div>
        </div>

        {/* Admin Select - المصدر الأساسي للـ 422 */}
        <div className="space-y-1">
          <label className="text-[9px] font-black uppercase tracking-[0.2em] text-[#00629B] ml-2 block">Assigned Manager</label>
          <div className="relative">
            <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
            <select 
              required 
              className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 pl-12 pr-4 text-xs font-bold outline-none focus:border-[#00629B] appearance-none cursor-pointer" 
              value={formData.admin_id} 
              onChange={(e) => setFormData({...formData, admin_id: e.target.value})}
            >
              <option value="">Select Protocol Manager</option>
              {Array.isArray(users) && users.map((user) => {
                // فحص دقيق للـ ID الموجود في مصفوفة المستخدمين
                const uId = user.id || user.user_id; 
                if (!uId) return null;

                return (
                  <option key={`user-${uId}`} value={uId}>
                    {user.username || user.full_name || `Admin ${uId}`}
                  </option>
                );
              })}
            </select>
          </div>
        </div>

        {/* Buttons */}
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