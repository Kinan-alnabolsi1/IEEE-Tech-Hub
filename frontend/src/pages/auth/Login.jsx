import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { postData } from '../../api/apiMethods'; 
import toast from 'react-hot-toast';
import Loader from '../../components/ui/Loader'; 
import { Eye, EyeOff, Clock, ShieldCheck, Mail, ArrowLeft } from 'lucide-react';
import logo from "../../assets/IEEELogo4-removebg-preview.png";

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isPending, setIsPending] = useState(false);

  // التوجيه التلقائي الآمن (إذا كان المستخدم مسجل دخول من قبل)
  useEffect(() => {
    const token = localStorage.getItem('ieee_token');
    const role = localStorage.getItem('user_role');
    
    if (token && role) {
      if (role === 'super_admin') navigate('/super-admin', { replace: true });
      else if (role === 'chapter_chair') navigate('/chapter-chair', { replace: true });
      else if (role === 'admin') navigate('/admin', { replace: true });
    }
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await postData('/login', { email: email.trim(), password });
      const data = response.data;
      
      if (data.access_token) {
        // تنظيف الكاش القديم لتجنب أي تعارض
        localStorage.clear(); 
        
        localStorage.setItem('ieee_token', data.access_token);
        localStorage.setItem('ieee_user', JSON.stringify(data.user));
        
        // 🌟 تحديد الرتبة الذكي من الباك إند 🌟
        let rawRole = String(data.user?.role || '').toLowerCase();
        let normalizedRole = 'volunteer'; 

        if (rawRole.includes('super')) {
            normalizedRole = 'super_admin';
        } else if (rawRole.includes('admin')) {
            normalizedRole = 'admin';
        } else if (rawRole.includes('chair') || rawRole.includes('chapter') || data.user?.chapter_id) {
            normalizedRole = 'chapter_chair';
        } else {
            normalizedRole = rawRole || 'volunteer';
        }

        console.log("🎯 Determined Role (Clean):", normalizedRole);

        localStorage.setItem('user_role', normalizedRole);
        localStorage.setItem('user_name', data.user?.full_name || data.user?.name || 'Member');
        
        if (data.user?.branch_id) localStorage.setItem('branch_id', data.user.branch_id);
        if (data.user?.chapter_id) localStorage.setItem('chapter_id', data.user.chapter_id);

        toast.success(`Welcome back!`);

        // التوجيه النهائي حسب الرتبة
        if (normalizedRole === 'super_admin') {
            navigate('/super-admin', { replace: true });
        } else if (normalizedRole === 'chapter_chair') {
            navigate('/chapter-chair', { replace: true });
        } else if (normalizedRole === 'admin') {
            navigate('/admin', { replace: true });
        } else {
            toast.error("Access restricted. You are logged in as a volunteer.");
            localStorage.clear();
            navigate('/', { replace: true });
        }
      }
    } catch (err) {
      const errorMsg = err.response?.data?.message || '';
      if (errorMsg.toLowerCase().includes('pending') || err.response?.status === 403) {
        setIsPending(true);
      } else {
        toast.error('Invalid Email or Password');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // ---------------- شاشة قيد المراجعة ----------------
  if (isPending) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-[#fcfcfd] font-sans selection:bg-blue-100 overflow-hidden relative">
        <div className="absolute inset-0 z-0 pointer-events-none">
          <div className="absolute top-[-10%] left-1/4 w-[500px] h-[500px] bg-blue-50/50 rounded-full blur-[100px] animate-pulse"></div>
          <div className="absolute bottom-[-10%] right-1/4 w-[400px] h-[400px] bg-indigo-50/30 rounded-full blur-[100px]"></div>
        </div>
        <div className="relative z-10 w-full max-w-[500px] px-6">
          <div className="flex flex-col items-center mb-8">
            <img className='w-12 mb-4 drop-shadow-sm' src={logo} alt="IEEE Logo"/>
            <h1 className="text-2xl font-light text-slate-900 tracking-[0.15em] uppercase text-center">
              IEEE <span className="font-semibold text-[#00629B]">Tech-Hub</span>
            </h1>
          </div>
          <div className="bg-white p-10 rounded-[3rem] shadow-[0_20px_60px_rgba(0,0,0,0.03)] border border-slate-50 text-center animate-in fade-in zoom-in-95 duration-500">
            <div className="relative w-24 h-24 mx-auto mb-6">
              <div className="absolute inset-0 bg-amber-100 rounded-full animate-ping opacity-50"></div>
              <div className="relative w-full h-full bg-amber-50 rounded-full border-4 border-white shadow-sm flex items-center justify-center">
                <Clock className="w-10 h-10 text-amber-500" />
              </div>
            </div>
            <h2 className="text-2xl font-black text-slate-800 tracking-tight mb-2">Account Under Review</h2>
            <p className="text-sm text-slate-400 font-medium leading-relaxed px-4 mb-8">
              Your registration was successful, but your account requires <span className="text-amber-500 font-bold">Administrator approval</span> before you can access the system.
            </p>
            <div className="space-y-4 mb-8 text-left bg-slate-50 p-6 rounded-[2rem]">
              <div className="flex items-start gap-3">
                <ShieldCheck className="w-5 h-5 text-[#00629B] shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-700">Security Verification</h4>
                  <p className="text-xs text-slate-400 mt-1">Our team is verifying your IEEE membership and branch assignment.</p>
                </div>
              </div>
              <div className="w-full h-px bg-slate-200"></div>
              <div className="flex items-start gap-3">
                <Mail className="w-5 h-5 text-[#00629B] shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-700">Email Notification</h4>
                  <p className="text-xs text-slate-400 mt-1">You will receive an email once your account is fully activated.</p>
                </div>
              </div>
            </div>
            <button type="button" onClick={() => { setIsPending(false); setPassword(''); }} className="inline-flex items-center justify-center gap-2 w-full py-4 bg-white text-slate-600 border-2 border-slate-100 hover:border-[#00629B] hover:text-[#00629B] rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] transition-all group">
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              Return to Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ---------------- شاشة الدخول الرئيسية ----------------
  return (
    <>
      {isLoading && <Loader message="Authenticating..." />}
      <div className="h-screen w-full flex items-center justify-center bg-[#fcfcfd] font-sans selection:bg-blue-100 overflow-hidden relative">
        <div className="absolute inset-0 z-0 pointer-events-none">
          <div className="absolute top-[-10%] left-1/4 w-[500px] h-[500px] bg-blue-50/50 rounded-full blur-[100px]"></div>
          <div className="absolute bottom-[-10%] right-1/4 w-[400px] h-[400px] bg-indigo-50/30 rounded-full blur-[100px]"></div>
        </div>
        <div className="relative z-10 w-full max-w-[420px] px-6">
          <div className="flex flex-col items-center mb-6">
            <img className='w-12 mb-3 drop-shadow-sm' src={logo} alt="IEEE Logo"/>
            <h1 className="text-xl font-light text-slate-900 tracking-[0.15em] uppercase text-center">
              IEEE <span className="font-semibold text-[#00629B]">Tech-Hub</span>
            </h1>
          </div>
          <div className="bg-white p-8 rounded-[2.5rem] shadow-[0_15px_40px_rgba(0,0,0,0.03)] border border-slate-50 animate-in fade-in zoom-in-95 duration-300">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-1">
                <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest ml-1">Email Address</label>
                <input 
                  type="email" 
                  required 
                  className="w-full bg-slate-50 border-transparent focus:bg-white focus:ring-2 focus:ring-blue-100 rounded-xl px-4 py-3.5 text-xs outline-none transition-all" 
                  placeholder="name@university.edu" 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)} 
                />
              </div>
              <div className="space-y-1">
                <div className="flex justify-between items-center px-1">
                  <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Password</label>
                  <button type="button" className="text-[8px] text-[#00629B] font-black uppercase tracking-tighter hover:underline">Forgot?</button>
                </div>
                <div className="relative">
                  <input 
                    type={showPassword ? "text" : "password"} 
                    required 
                    className="w-full bg-slate-50 border-transparent focus:bg-white focus:ring-2 focus:ring-blue-100 rounded-xl px-4 py-3.5 text-xs outline-none transition-all pr-12" 
                    placeholder="••••••••" 
                    value={password} 
                    onChange={(e) => setPassword(e.target.value)} 
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-slate-400 hover:text-[#00629B]">
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <button type="submit" disabled={isLoading} className="w-full mt-4 py-4 bg-[#00629B] text-white rounded-2xl font-bold text-[10px] uppercase tracking-[0.2em] shadow-lg hover:bg-[#005282] active:scale-[0.98] transition-all disabled:opacity-70">
                {isLoading ? 'Authenticating...' : 'Sign In to Portal'}
              </button>
            </form>
          </div>
          <div className="mt-8 text-center">
            <Link to="/register" className="text-[10px] text-slate-400 hover:text-[#00629B] tracking-wide transition-colors">
              Don't have an account? <span className="font-bold text-[#00629B] border-b border-blue-100 ml-1">Join IEEE Community</span>
            </Link>
          </div>
        </div>
      </div>
    </>
  );
};

export default Login;