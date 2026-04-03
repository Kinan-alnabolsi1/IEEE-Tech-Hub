import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import Loader from '../../components/ui/Loader'; 

const API_BASE_URL = 'http://localhost:8000/api';

const Register = () => {
  const navigate = useNavigate();
  const [role, setRole] = useState('volunteer');
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    membershipId: '',
    branch: ''
  });

  // حارس: إذا كان مسجل دخول يطرده للداشبورد
  useEffect(() => {
    const token = localStorage.getItem('ieee_token');
    if (token) navigate('/admin');
  }, [navigate]);

  const branches = ["Computer Society", "Communications Society", "Robotics and Automation", "Power & Energy Society", "Women in Engineering"];

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const payload = {
        username: formData.username,
        email: formData.email,
        password: formData.password,
        password_confirmation: formData.password,
        full_name: formData.username, // إرسال اليوزر نيم كإسم كامل ليقبله السيرفر
        role: role.charAt(0).toUpperCase() + role.slice(1), 
        branch: formData.branch,
        membership_id: formData.membershipId
      };

      await axios.post(`${API_BASE_URL}/register`, payload);
      toast.success('Registration Successful!');
      setTimeout(() => navigate('/login'), 1500);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error creating account');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {isLoading && <Loader message="Creating Account..." />}
      <div className="h-screen w-full flex items-center justify-center bg-[#fcfcfd] font-sans selection:bg-blue-100 overflow-hidden relative">
        <div className="absolute inset-0 z-0 pointer-events-none">
          <div className="absolute top-[-10%] left-1/4 w-[500px] h-[500px] bg-blue-50/50 rounded-full blur-[100px]"></div>
          <div className="absolute bottom-[-10%] right-1/4 w-[400px] h-[400px] bg-indigo-50/30 rounded-full blur-[100px]"></div>
        </div>
        <div className="relative z-10 w-full max-w-[420px] px-6">
          <div className="flex flex-col items-center mb-4 animate-in fade-in slide-in-from-bottom-3 duration-700">
            <div className="w-12 h-12 mb-3 bg-white shadow-sm rounded-xl flex items-center justify-center text-[#00629B] border border-slate-50">
              <svg viewBox="0 0 24 24" className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h1 className="text-xl font-light text-slate-900 tracking-[0.15em] uppercase text-center">IEEE <span className="font-semibold text-[#00629B]">Portal</span></h1>
          </div>
          <div className="bg-white p-6 rounded-[2rem] shadow-[0_15px_40px_rgba(0,0,0,0.03)] border border-slate-50">
            <div className="flex gap-2 mb-5 bg-slate-50 p-1 rounded-xl">
              {['admin', 'volunteer'].map(r => (
                <button key={r} type="button" onClick={() => setRole(r)} className={`flex-1 py-2 rounded-lg text-[9px] font-bold uppercase tracking-wider transition-all ${role === r ? 'bg-[#00629B] text-white' : 'text-slate-400'}`}>
                  {r === 'admin' ? 'Branch Admin' : 'Volunteer'}
                </button>
              ))}
            </div>
            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest ml-1">User Name</label>
                <input name="username" type="text" required className="w-full bg-slate-50 border-none rounded-lg px-4 py-2.5 text-xs outline-none" onChange={handleInputChange} />
              </div>
              <div>
                <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest ml-1">Email</label>
                <input name="email" type="email" required className="w-full bg-slate-50 border-none rounded-lg px-4 py-2.5 text-xs outline-none" onChange={handleInputChange} />
              </div>
              <div>
                <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest ml-1">Branch</label>
                <select name="branch" required className="w-full bg-slate-50 border-none rounded-lg px-4 py-2.5 text-xs outline-none" onChange={handleInputChange} value={formData.branch}>
                  <option value="" disabled>Select branch</option>
                  {branches.map(b => <option key={b} value={b}>{b}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <input name="membershipId" type="text" required placeholder="Member ID" className="bg-slate-50 rounded-lg px-4 py-2.5 text-xs outline-none" onChange={handleInputChange} />
                <input name="password" type="password" required placeholder="Password" className="bg-slate-50 rounded-lg px-4 py-2.5 text-xs outline-none" onChange={handleInputChange} />
              </div>
              <button type="submit" disabled={isLoading} className="w-full mt-4 py-3.5 bg-[#00629B] text-white rounded-xl font-bold text-[10px] uppercase tracking-[0.2em] shadow-lg disabled:opacity-70">
                {isLoading ? 'Processing...' : 'Complete Registration'}
              </button>
            </form>
          </div>
          <div className="mt-6 text-center">
            <Link to="/login" className="text-[10px] text-slate-400 hover:text-[#00629B] tracking-wide">Already a member? <span className="font-bold text-[#00629B]">Sign In</span></Link>
          </div>
        </div>
      </div>
    </>
  );
};

export default Register;