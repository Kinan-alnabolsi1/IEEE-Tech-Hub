import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';

const API_BASE_URL = 'http://192.168.1.11:5173/api';

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await axios.post(`${API_BASE_URL}/login`, {
        email,
        password
      });

      const data = response.data;
      if (data.token) {
        localStorage.setItem('ieee_token', data.token);
      }
      
      console.log('Login Successful:', data);
      // التوجه للوحة التحكم بعد النجاح
      navigate('/dashboard'); 

    } catch (err) {
      const errorMessage = err.response?.data?.message || 'بيانات الدخول غير صحيحة';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    /* h-screen و overflow-hidden لجعلها متطابقة مع Register */
    <div className="h-screen w-full flex items-center justify-center bg-[#fcfcfd] font-sans selection:bg-blue-100 overflow-hidden relative">
      
      {/* خلفية ناعمة ثابتة */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-1/4 w-[500px] h-[500px] bg-blue-50/50 rounded-full blur-[100px]"></div>
        <div className="absolute bottom-[-10%] right-1/4 w-[400px] h-[400px] bg-indigo-50/30 rounded-full blur-[100px]"></div>
      </div>

      <div className="relative z-10 w-full max-w-[420px] px-6">
        
        {/* الشعار - تطابق المسافات مع Register */}
        <div className="flex flex-col items-center mb-6 animate-in fade-in slide-in-from-bottom-3 duration-700">
          <div className="w-12 h-12 mb-3 bg-white shadow-sm rounded-xl flex items-center justify-center text-[#00629B] border border-slate-50">
            <svg viewBox="0 0 24 24" className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <h1 className="text-xl font-light text-slate-900 tracking-[0.15em] uppercase text-center">
            IEEE <span className="font-semibold text-[#00629B]">Portal</span>
          </h1>
          <div className="h-[1px] w-6 bg-slate-100 mt-3"></div>
        </div>

        {/* كرت تسجيل الدخول - p-6 و rounded-[2rem] للتطابق */}
        <div className="bg-white p-8 rounded-[2rem] shadow-[0_15px_40px_rgba(0,0,0,0.03)] border border-slate-50 animate-in fade-in zoom-in-95 duration-1000">
          
          {error && (
            <div className="mb-4 p-2 bg-red-50 text-red-500 text-[9px] uppercase tracking-wider text-center rounded-lg border border-red-100 animate-pulse font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* البريد الإلكتروني */}
            <div className="space-y-1">
              <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest ml-1">Email Address</label>
              <input 
                type="email" 
                required
                className="w-full bg-slate-50 border border-transparent rounded-lg px-4 py-3 text-xs focus:bg-white focus:border-blue-100 transition-all outline-none text-slate-700"
                placeholder="member@ieee.org"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            {/* كلمة المرور */}
            <div className="space-y-1">
              <div className="flex justify-between items-center px-1">
                <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Password</label>
                <button type="button" className="text-[8px] text-[#00629B] font-bold hover:opacity-70 transition-opacity uppercase tracking-tighter">Forgot?</button>
              </div>
              <input 
                type="password" 
                required
                className="w-full bg-slate-50 border border-transparent rounded-lg px-4 py-3 text-xs focus:bg-white focus:border-blue-100 transition-all outline-none text-slate-700"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            {/* زر الدخول */}
            <button 
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 py-3.5 bg-[#00629B] text-white rounded-xl font-bold text-[10px] uppercase tracking-[0.2em] shadow-lg shadow-blue-900/10 hover:bg-[#005282] transition-all duration-300 disabled:opacity-70"
            >
              {isLoading ? 'Authenticating...' : 'Sign In to Portal'}
            </button>
          </form>
        </div>

        {/* تذييل الصفحة - Link بدلاً من onNavigate */}
        <div className="mt-8 text-center">
          <Link 
            to="/register" 
            className="text-[10px] text-slate-400 hover:text-[#00629B] transition-colors tracking-wide"
          >
            Don't have an account? <span className="font-bold text-[#00629B]">Join IEEE</span>
          </Link>
          
          <div className="flex justify-center items-center space-x-3 mt-6 text-[8px] text-slate-300 uppercase tracking-[0.2em] font-light">
            <span>Privacy</span>
            <span className="w-1 h-1 bg-slate-200 rounded-full"></span>
            <span>Terms</span>
            <span className="w-1 h-1 bg-slate-200 rounded-full"></span>
            <span>Contact</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;