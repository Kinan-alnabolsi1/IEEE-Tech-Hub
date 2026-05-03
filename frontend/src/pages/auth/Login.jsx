import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { postData } from '../../api/apiMethods'; 
import toast from 'react-hot-toast';
import Loader from '../../components/ui/Loader'; 
import { Eye, EyeOff } from 'lucide-react';
import logo from "../../assets/IEEELogo4-removebg-preview.png";

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('ieee_token');
    const role = localStorage.getItem('user_role');
    
    if (token && role) {
      redirectUser(role);
    }
  }, [navigate]);

  const redirectUser = (role, user = null) => {
    if (role === 'super_admin') navigate('/super-admin', { replace: true });
    else if (role === 'admin') navigate('/admin', { replace: true });
    else if (role === 'chapter_chair') navigate('/chapter-chair', { replace: true });
    else if (role === 'volunteer') {
      // 🌟 التحقق من الـ Onboarding للمتطوع
      // إذا لم يكن لديه كلية مخزنة، نعتبره بحاجة لإكمال البيانات
      if (user && !user.faculty) {
        navigate('/onboarding', { replace: true });
      } else {
        navigate('/volunteer', { replace: true });
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await postData('/login', { email: email.trim(), password });
      const data = response.data;
      
      if (data.access_token) {
        localStorage.clear(); 
        localStorage.setItem('ieee_token', data.access_token);
        localStorage.setItem('ieee_user', JSON.stringify(data.user));
        localStorage.setItem('user_id', String(data.user?.id)); // مهم للبروفايل والفلترة
        localStorage.setItem('user_name', data.user?.full_name || 'Member');
        

        const chapterId = data.user?.managed_chapter_id || data.user?.chapter_id;
        if (chapterId) localStorage.setItem('chapter_id', String(chapterId));

        let rawRole = String(data.user?.role || '').toLowerCase();
        let normalizedRole = 'volunteer';
        
        if (rawRole.includes('super')) normalizedRole = 'super_admin';
        else if (rawRole.includes('admin')) normalizedRole = 'admin';
        else if (rawRole.includes('chair') || data.user?.managed_chapter_id) normalizedRole = 'chapter_chair';

        localStorage.setItem('user_role', normalizedRole);
        if (data.user?.branch_id) localStorage.setItem('branch_id', String(data.user.branch_id));

        toast.success(`Welcome back, ${data.user.full_name}!`);
        redirectUser(normalizedRole, data.user);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid Credentials');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {isLoading && <Loader message="Authenticating..." />}
      <div className="h-screen w-full flex items-center justify-center bg-[#fcfcfd] font-sans relative overflow-hidden">
        <div className="relative z-10 w-full max-w-[420px] px-6">
          <div className="flex flex-col items-center mb-8">
            <img className='w-12 mb-3' src={logo} alt="IEEE Logo"/>
            <h1 className="text-xl font-light text-slate-900 tracking-[0.15em] uppercase text-center">
              IEEE <span className="font-semibold text-[#00629B]">Tech-Hub</span>
            </h1>
          </div>
          <div className="bg-white p-8 rounded-[2.5rem] shadow-2xl border border-slate-50">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-1">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Email Address</label>
                <input type="email" required className="w-full bg-slate-50 border-transparent focus:bg-white focus:ring-2 focus:ring-blue-100 rounded-xl px-4 py-3.5 text-xs outline-none transition-all" placeholder="name@university.edu" value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>
              <div className="space-y-1">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Password</label>
                <div className="relative">
                  <input type={showPassword ? "text" : "password"} required className="w-full bg-slate-50 border-transparent focus:bg-white focus:ring-2 focus:ring-blue-100 rounded-xl px-4 py-3.5 text-xs outline-none transition-all pr-12" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-slate-400 hover:text-[#00629B]">
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <button type="submit" disabled={isLoading} className="w-full mt-4 py-4 bg-[#00629B] text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] shadow-lg hover:bg-[#005282] transition-all">
                {isLoading ? 'Authenticating...' : 'Sign In to Portal'}
              </button>
            </form>
            <div className="mt-8 text-center">
              <Link to="/register" className="text-[10px] text-slate-400 hover:text-[#00629B] tracking-wide transition-colors">
                Don't have an account? <span className="font-bold text-[#00629B] border-b border-blue-100 ml-1">Join IEEE Community</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Login;