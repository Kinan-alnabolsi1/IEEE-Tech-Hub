import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import BaseModal from './BaseModal'; 
import { volunteerService } from '../../services/volunteerService';
import { Award, LogOut } from 'lucide-react';
import api from '../../api/apiMethods';

const RoleSyncWatcher = ({ role }) => {
    const [showModal, setShowModal] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const checkRoleStatus = async () => {
            const currentRole = role?.toLowerCase();
            
            if (currentRole !== 'volunteer') return;

            try {
                const res = await volunteerService.getProfile();
                const userData = res.data?.data || res.data;
                const actualRole = userData?.role?.toLowerCase();

                if (actualRole && actualRole !== 'volunteer') {
                    setShowModal(true);
                }
            } catch (error) {
                console.error("Role sync check failed", error);
            }
        };

        checkRoleStatus();

        const interval = setInterval(checkRoleStatus, 2 * 60 * 1000); 
        return () => clearInterval(interval);
    }, [role]);

    const handleForceLogout = async () => {
        try {
            await api.post('/logout'); 
        } catch (e) {
            console.error("Logout error", e);
        } finally {
            localStorage.clear();
            navigate('/', { replace: true });
        }
    };

    if (!showModal) return null;

    return (
        <BaseModal 
    isOpen={showModal} 
    onClose={() => {}} 
    showCloseButton={false} 
    title="🎉 Promotion Alert!"
>
            <div className="text-center py-6 space-y-6 animate-in zoom-in duration-500">
                <div className="w-24 h-24 bg-amber-50 text-amber-500 rounded-full flex items-center justify-center mx-auto border-4 border-amber-100 shadow-lg">
                    <Award size={48} strokeWidth={2.5} />
                </div>
                
                <div className="space-y-2">
                    <h2 className="text-2xl font-black text-[#00629B] uppercase italic tracking-tight">
                        Congratulations!
                    </h2>
                    <p className="text-sm font-bold text-slate-500 leading-relaxed px-4">
                        لقد تم تعيينك رسمياً كـ <span className="text-amber-500 font-black">قائد مشروع (Project Leader)</span>! 
                        للوصول إلى لوحة التحكم الجديدة وأدوات الإدارة، يرجى إعادة تسجيل الدخول لتحديث صلاحياتك.
                    </p>
                </div>

                <div className="pt-4">
                    <button 
                        onClick={handleForceLogout}
                        className="w-full py-4 bg-[#00629B] text-white rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] flex items-center justify-center gap-3 hover:bg-slate-900 transition-all shadow-xl active:scale-95"
                    >
                        تسجيل الخروج والتحديث <LogOut size={16} />
                    </button>
                </div>
            </div>
        </BaseModal>
    );
};

export default RoleSyncWatcher;