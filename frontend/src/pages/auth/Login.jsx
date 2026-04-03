import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import Loader from '../../components/ui/Loader'; 

const API_BASE_URL = 'http://localhost:8000/api';

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // حارس: إذا كان مسجل دخول، وجهه فوراً للداشبورد المناسب
  useEffect(() => {
    const token = localStorage.getItem('ieee_token');
    const role = localStorage.getItem('user_role');
    if (token && role) {
      if (role.toLowerCase() === 'super admin') navigate('/super-admin');
      else navigate('/admin');
    }
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await axios.post(`${API_BASE_URL}/login`, { email, password });
      const data = response.data;
      
      if (data.access_token) {
        localStorage.setItem('ieee_token', data.access_token);
        localStorage.setItem('user_role', data.user.role); 
        localStorage.setItem('user_name', data.user.full_name);
      }
      
      toast.success(`Welcome back, ${data.user.username}!`);

      // التوجيه حسب الرتبة (يتعامل مع Super Admin بمسافة)
      const userRole = data.user.role.toLowerCase();
      if (userRole === 'super admin') navigate('/super-admin');
      else navigate('/admin');

    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid Credentials');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {isLoading && <Loader message="Verifying Identity..." />}
      <div className="h-screen w-full flex items-center justify-center bg-[#fcfcfd] font-sans selection:bg-blue-100 overflow-hidden relative">
        <div className="absolute inset-0 z-0 pointer-events-none">
          <div className="absolute top-[-10%] left-1/4 w-[500px] h-[500px] bg-blue-50/50 rounded-full blur-[100px]"></div>
          <div className="absolute bottom-[-10%] right-1/4 w-[400px] h-[400px] bg-indigo-50/30 rounded-full blur-[100px]"></div>
        </div>
        <div className="relative z-10 w-full max-w-[420px] px-6">
          <div className="flex flex-col items-center mb-6 animate-in fade-in slide-in-from-bottom-3 duration-700">
            <div className="w-12 h-12 mb-3 bg-white shadow-sm rounded-xl flex items-center justify-center text-[#00629B] border border-slate-50">
              <svg viewBox="0 0 24 24" className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h1 className="text-xl font-light text-slate-900 tracking-[0.15em] uppercase text-center">IEEE <span className="font-semibold text-[#00629B]">Portal</span></h1>
          </div>
          <div className="bg-white p-8 rounded-[2rem] shadow-[0_15px_40px_rgba(0,0,0,0.03)] border border-slate-50">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest ml-1">Email</label>
                <input type="email" required className="w-full bg-slate-50 border-none rounded-lg px-4 py-3 text-xs outline-none" placeholder="admin@ieee-techhub.org" value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>
              <div className="space-y-1">
                <div className="flex justify-between items-center px-1">
                  <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Password</label>
                  <button type="button" className="text-[8px] text-[#00629B] font-bold uppercase tracking-tighter">Forgot?</button>
                </div>
                <input type="password" required className="w-full bg-slate-50 border-none rounded-lg px-4 py-3 text-xs outline-none" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} />
              </div>
              <button type="submit" disabled={isLoading} className="w-full mt-2 py-3.5 bg-[#00629B] text-white rounded-xl font-bold text-[10px] uppercase tracking-[0.2em] shadow-lg hover:bg-[#005282] transition-all disabled:opacity-70">
                {isLoading ? 'Authenticating...' : 'Sign In to Portal'}
              </button>
            </form>
          </div>
          <div className="mt-8 text-center">
            <Link to="/register" className="text-[10px] text-slate-400 hover:text-[#00629B] tracking-wide">Don't have an account? <span className="font-bold text-[#00629B]">Join IEEE</span></Link>
          </div>
        </div>
      </div>
    </>
  );
};

export default Login;