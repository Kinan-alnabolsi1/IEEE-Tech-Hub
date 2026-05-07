import React, { useEffect } from 'react';
import { X } from 'lucide-react';

// 🌟 ضفنا showCloseButton وعطيناه قيمة افتراضية true لحتى ما يخرب باقي الموديلات
const BaseModal = ({ isOpen, onClose, title, subtitle, children, showCloseButton = true }) => {
  useEffect(() => {
    const handleEsc = (e) => { 
        // 🌟 منعنا زر Escape من الإغلاق إذا كان الإكس مخفي (يعني مودال إجباري)
        if (e.key === 'Escape' && showCloseButton) onClose(); 
    };
    if (isOpen) window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isOpen, onClose, showCloseButton]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300 cursor-pointer"
        // 🌟 منعنا إغلاق المودال عند الضغط على الخلفية الرمادية إذا كان الإكس مخفي
        onClick={showCloseButton ? onClose : undefined} 
      />
      <div 
        className="bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl relative z-10 animate-in zoom-in-95 duration-300 overflow-hidden"
        onClick={(e) => e.stopPropagation()} 
      >
        <div className="px-8 py-6 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
          
          <div>
            <h2 className="text-xl font-black text-[#00629B] uppercase italic tracking-tighter">{title}</h2>
            {subtitle && (
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em] mt-1">
                {subtitle}
              </p>
            )}
          </div>

          {/* 🌟 هون الشرط السحري: زر الإكس ما بيطلع إلا إذا كانت showCloseButton تساوي true */}
          {showCloseButton && (
            <button onClick={onClose} className="p-2 hover:bg-red-50 hover:text-red-500 rounded-xl transition-colors text-slate-300">
              <X className="w-6 h-6" />
            </button>
          )}

        </div>
        
        <div className="p-8 max-h-[80vh] overflow-y-auto no-scrollbar">
          {children}
        </div>
      </div>
    </div>
  );
};

export default BaseModal;