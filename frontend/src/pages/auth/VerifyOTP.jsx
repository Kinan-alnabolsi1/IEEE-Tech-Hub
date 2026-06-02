import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { postData } from '../../api/apiMethods';
import toast from 'react-hot-toast';
import { Loader2, ShieldCheck, RefreshCw } from 'lucide-react';

const VerifyOTP = () => {
    const [otp, setOtp] = useState('');
    const [loading, setLoading] = useState(false);
    const [resending, setResending] = useState(false);
    const [timer, setTimer] = useState(60); 
    const navigate = useNavigate();
    const location = useLocation();
    
    const email = location.state?.email || localStorage.getItem('temp_email');

    useEffect(() => {
        if (!email) {
            navigate('/login');
        }
    }, [email, navigate]);

    useEffect(() => {
        if (timer > 0) {
            const interval = setInterval(() => setTimer(timer - 1), 1000);
            return () => clearInterval(interval);
        }
    }, [timer]);

    const handleVerify = async (e) => {
        e.preventDefault();
        if (otp.length < 6) return toast.error("Please enter the full 6-digit code");

        setLoading(true);
        try {

await postData('/verify-otp', { email: email, otp: otp }); 
            
            toast.success("Account verified successfully! Please login.");
            localStorage.removeItem('temp_email');
            navigate('/');
        } catch (error) {
            toast.error(error.response?.data?.message || "Invalid OTP code");
        } finally {
            setLoading(false);
        }
    };

    const handleResend = async () => {
        setResending(true);
        try {
            await postData('/resend-otp', { email });
            toast.success("A new code has been sent!");
            setTimer(60); 
        } catch (error) {
            toast.error("Failed to resend code",error);
        } finally {
            setResending(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#fcfcfd] p-4 font-sans">
            <div className="max-w-[420px] w-full bg-white rounded-[2.5rem] p-8 shadow-2xl border border-slate-50 animate-in fade-in zoom-in duration-500">
                <div className="text-center space-y-4 mb-8">
                    <div className="w-16 h-16 bg-blue-50/50 rounded-2xl flex items-center justify-center mx-auto text-[#00629B] border border-blue-100/50">
                        <ShieldCheck size={32} />
                    </div>
                    <h1 className="text-xl font-light text-slate-900 tracking-[0.1em] uppercase">Verify <span className="font-semibold text-[#00629B]">Identity</span></h1>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-relaxed">
                        6-digit code sent to <br/><span className="text-[#00629B] lowercase tracking-normal">{email}</span>
                    </p>
                </div>

                <form onSubmit={handleVerify} className="space-y-6">
                    <input 
                        required
                        type="text" 
                        maxLength="6"
                        placeholder="• • • • • •"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                        className="w-full h-16 bg-slate-50 border-2 border-slate-50 rounded-2xl text-center text-3xl font-black tracking-[0.5em] text-[#00629B] focus:border-blue-100 outline-none transition-all placeholder:text-slate-200"
                    />

                    <button 
                        type="submit" 
                        disabled={loading}
                        className="w-full bg-[#00629B] text-white py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-lg hover:bg-[#005282] transition-all flex items-center justify-center gap-2"
                    >
                        {loading ? <Loader2 className="animate-spin" size={16} /> : "Verify Account"}
                    </button>
                </form>

                <div className="mt-8 text-center">
                    <button 
                        onClick={handleResend}
                        disabled={resending || timer > 0}
                        className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-[#00629B] disabled:opacity-50 disabled:hover:text-slate-400 transition-colors flex items-center justify-center gap-2 mx-auto"
                    >
                        {resending ? <Loader2 className="animate-spin" size={12} /> : <RefreshCw size={12} />}
                        {timer > 0 ? `Resend Code in ${timer}s` : "Resend New Code"}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default VerifyOTP;