import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';

const Register = () => {
  const navigate = useNavigate();
  const [role, setRole] = useState('volunteer');
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    membershipId: '',
    branch: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const branches = [
    "Computer Society",
    "Communications Society",
    "Robotics and Automation",
    "Power & Energy Society",
    "Women in Engineering"
  ];

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    const API_BASE_URL = 'http://192.168.1.11:5173/api';

    try {
      const response = await axios.post(`${API_BASE_URL}/register`, {
        ...formData,
        role
      });
      console.log('Success:', response.data);
      // بعد النجاح ننتقل لصفحة اللوجن
      navigate('/login');
    } catch (err) {
      const message = err.response?.data?.message || 'حدث خطأ في الاتصال بالسيرفر';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    /* h-screen و overflow-hidden لمنع السكرول */
    <div className="h-screen w-full flex items-center justify-center bg-[#fcfcfd] font-sans selection:bg-blue-100 overflow-hidden relative">
      
      {/* خلفية جمالية ثابتة */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-1/4 w-[500px] h-[500px] bg-blue-50/50 rounded-full blur-[100px]"></div>
        <div className="absolute bottom-[-10%] right-1/4 w-[400px] h-[400px] bg-indigo-50/30 rounded-full blur-[100px]"></div>
      </div>

      <div className="relative z-10 w-full max-w-[420px] px-6">
        
        {/* الشعار - تم تصغير المسافات mb-4 */}
        <div className="flex flex-col items-center mb-4 animate-in fade-in slide-in-from-bottom-3 duration-700">
          <div className="w-12 h-12 mb-3 bg-white shadow-sm rounded-xl flex items-center justify-center text-[#00629B] border border-slate-50">
            <svg viewBox="0 0 24 24" className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <h1 className="text-xl font-light text-slate-900 tracking-[0.15em] uppercase text-center">
            IEEE <span className="font-semibold text-[#00629B]">Portal</span>
          </h1>
        </div>

        {/* كرت التسجيل - تقليل الـ padding إلى p-6 */}
        <div className="bg-white p-6 rounded-[2rem] shadow-[0_15px_40px_rgba(0,0,0,0.03)] border border-slate-50 animate-in fade-in zoom-in-95 duration-1000">
          
          {error && (
            <div className="mb-3 p-2 bg-red-50 text-red-500 text-[9px] uppercase tracking-wider text-center rounded-lg border border-red-100 animate-pulse">
              {error}
            </div>
          )}

          {/* اختيار الدور - mb-5 */}
          <div className="flex gap-2 mb-5 bg-slate-50 p-1 rounded-xl">
            <button 
              type="button"
              onClick={() => setRole('admin')}
              className={`flex-1 py-2 rounded-lg text-[9px] font-bold uppercase tracking-wider transition-all duration-300 ${role === 'admin' ? 'bg-[#00629B] text-white shadow-md' : 'text-slate-400 hover:text-slate-600'}`}
            >
              Branch Admin
            </button>
            <button 
              type="button"
              onClick={() => setRole('volunteer')}
              className={`flex-1 py-2 rounded-lg text-[9px] font-bold uppercase tracking-wider transition-all duration-300 ${role === 'volunteer' ? 'bg-[#00629B] text-white shadow-md' : 'text-slate-400 hover:text-slate-600'}`}
            >
              Volunteer
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="space-y-1">
              <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest ml-1">User Name</label>
              <input 
                name="username"
                type="text" 
                required
                className="w-full bg-slate-50 border border-transparent rounded-lg px-4 py-2.5 text-xs focus:bg-white focus:border-blue-100 transition-all outline-none"
                placeholder="Ahmad_IEEE"
                onChange={handleInputChange}
              />
            </div>

            <div className="space-y-1">
              <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest ml-1">Email Address</label>
              <input 
                name="email"
                type="email" 
                required
                className="w-full bg-slate-50 border border-transparent rounded-lg px-4 py-2.5 text-xs focus:bg-white focus:border-blue-100 transition-all outline-none"
                placeholder="member@ieee.org"
                onChange={handleInputChange}
              />
            </div>

            <div className="space-y-1">
              <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest ml-1">Branch</label>
              <div className="relative">
                <select 
                  name="branch"
                  required
                  className="w-full bg-slate-50 border border-transparent rounded-lg px-4 py-2.5 text-xs focus:bg-white focus:border-blue-100 transition-all outline-none appearance-none cursor-pointer pr-10 text-slate-600"
                  onChange={handleInputChange}
                  value={formData.branch}
                >
                  <option value="" disabled>Select branch</option>
                  {branches.map((b, index) => (
                    <option key={index} value={b}>{b}</option>
                  ))}
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                  <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest ml-1">Member ID</label>
                <input 
                  name="membershipId"
                  type="text" 
                  required
                  className="w-full bg-slate-50 border border-transparent rounded-lg px-4 py-2.5 text-xs focus:bg-white focus:border-blue-100 transition-all outline-none"
                  placeholder="ID"
                  onChange={handleInputChange}
                />
              </div>
              <div className="space-y-1">
                <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest ml-1">Password</label>
                <input 
                  name="password"
                  type="password" 
                  required
                  className="w-full bg-slate-50 border border-transparent rounded-lg px-4 py-2.5 text-xs focus:bg-white focus:border-blue-100 transition-all outline-none"
                  placeholder="••••"
                  onChange={handleInputChange}
                />
              </div>
            </div>

            <button 
              type="submit"
              disabled={isLoading}
              className="w-full mt-4 py-3.5 bg-[#00629B] text-white rounded-xl font-bold text-[10px] uppercase tracking-[0.2em] shadow-lg shadow-blue-900/10 hover:bg-[#005282] transition-all disabled:opacity-70"
            >
              {isLoading ? 'Processing...' : 'Complete Registration'}
            </button>
          </form>
        </div>

        {/* رابط التنقل السفلي */}
        <div className="mt-6 text-center">
          <Link 
            to="/login" 
            className="text-[10px] text-slate-400 hover:text-[#00629B] transition-colors tracking-wide"
          >
            Already a member? <span className="font-bold text-[#00629B]">Sign In</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Register;