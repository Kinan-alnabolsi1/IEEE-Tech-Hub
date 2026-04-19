import React, { useState, useEffect } from 'react';
import { postData } from '../../api/apiMethods'; 
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import Loader from '../../components/ui/Loader'; 
import { Eye, EyeOff } from 'lucide-react';
import logo from "../../assets/IEEELogo4-removebg-preview.png";

const Register = () => {
  const navigate = useNavigate();
  const [role, setRole] = useState('Volunteer'); 
  const [isLoading, setIsLoading] = useState(false);
  
  // حالات التحكم بظهور كلمات المرور
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const [formData, setFormData] = useState({
    username: '',
    full_name: '',
    email: '',
    ieee_membership_number: '',
    password: '',
    password_confirmation: '', // 🌟 تمت إضافة حقل التأكيد هنا
  });

  useEffect(() => {
    const token = localStorage.getItem('ieee_token');
    if (token) navigate('/admin');
  }, [navigate]);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // 🛡️ دالة فحص قوة كلمة المرور
  const isPasswordStrong = (password) => {
    const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]{8,}$/;
    return strongPasswordRegex.test(password);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // 1. التحقق من تطابق كلمتي المرور
    if (formData.password !== formData.password_confirmation) {
      toast.error('Passwords do not match. Please try again.', { duration: 3000 });
      return;
    }

    // 2. التحقق من قوة كلمة المرور
    if (!isPasswordStrong(formData.password)) {
      toast.error('Password must be at least 8 characters, include an uppercase letter, a number, and a special character (!@#$&*).', { duration: 5000 });
      return;
    }

    setIsLoading(true);

    try {
      // 🌟 تم ربط البيانات لترسل تماماً كما يطلبها الباك إند
      const payload = {
        username: formData.username,
        email: formData.email,
        password: formData.password,
        password_confirmation: formData.password_confirmation,
        full_name: formData.full_name, 
        role: role === 'Admin' ? 'Branch Admin' : role, 
        ieee_membership_number: formData.ieee_membership_number,
      };

      await postData('/register', payload);
      
      toast.success('Registration Successful! Please login.');
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
        
        <div className="relative z-10 w-full max-w-[480px] px-6">
          <div className="flex flex-col items-center mb-4">
            <img className='w-10 mb-3' src={logo} alt="IEEE Logo"/>
            <h1 className="text-xl font-light text-slate-900 tracking-[0.15em] uppercase text-center">
              IEEE <span className="font-semibold text-[#00629B]">Tech-Hub</span>
            </h1>
          </div>
          
          <div className="bg-white p-8 rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.02)] border border-slate-50">
            {/* Role Switcher */}
            <div className="flex gap-2 mb-6 bg-slate-50 p-1.5 rounded-2xl">
              {['Admin', 'Volunteer'].map(r => (
                <button 
                  key={r} 
                  type="button" 
                  onClick={() => setRole(r)} 
                  className={`flex-1 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${role === r ? 'bg-[#00629B] text-white shadow-lg' : 'text-slate-400 hover:text-slate-600'}`}
                >
                  {r === 'Admin' ? 'Branch Admin' : 'Volunteer'}
                </button>
              ))}
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              
              {/* Row 1: Username & Full Name */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Username</label>
                  <input name="username" type="text" required placeholder="john_doe" className="w-full bg-slate-50 border-none rounded-xl px-4 py-3 text-xs outline-none focus:ring-2 focus:ring-blue-100 transition-all" onChange={handleInputChange} />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Full Name</label>
                  <input name="full_name" type="text" required placeholder="John Doe" className="w-full bg-slate-50 border-none rounded-xl px-4 py-3 text-xs outline-none focus:ring-2 focus:ring-blue-100 transition-all" onChange={handleInputChange} />
                </div>
              </div>

              {/* Row 2: Email & Member ID */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Email Address</label>
                  <input name="email" type="email" required placeholder="name@university.edu" className="w-full bg-slate-50 border-none rounded-xl px-4 py-3 text-xs outline-none focus:ring-2 focus:ring-blue-100 transition-all" onChange={handleInputChange} />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Member ID</label>
                  <input name="ieee_membership_number" type="text" required placeholder="e.g. 98765432" className="w-full bg-slate-50 border-none rounded-xl px-4 py-3 text-xs outline-none focus:ring-2 focus:ring-blue-100 transition-all" onChange={handleInputChange} />
                </div>
              </div>

              {/* Row 3: Password & Confirm Password */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Password</label>
                  <div className="relative">
                    <input 
                      name="password" 
                      type={showPassword ? "text" : "password"} 
                      required 
                      placeholder="••••••••" 
                      className="w-full bg-slate-50 border-none rounded-xl px-4 py-3 text-xs outline-none focus:ring-2 focus:ring-blue-100 transition-all pr-10" 
                      onChange={handleInputChange} 
                    />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-slate-400 hover:text-[#00629B] transition-colors">
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                
                <div className="space-y-1.5">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Confirm</label>
                  <div className="relative">
                    <input 
                      name="password_confirmation" 
                      type={showConfirmPassword ? "text" : "password"} 
                      required 
                      placeholder="••••••••" 
                      className="w-full bg-slate-50 border-none rounded-xl px-4 py-3 text-xs outline-none focus:ring-2 focus:ring-blue-100 transition-all pr-10" 
                      onChange={handleInputChange} 
                    />
                    <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-slate-400 hover:text-[#00629B] transition-colors">
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>
              
              <p className="text-[8.5px] text-slate-400 px-1 leading-tight mt-1">
                * Password must be at least 8 characters, include an uppercase letter, a number, and a special character.
              </p>

              <button type="submit" disabled={isLoading} className="w-full mt-4 py-4 bg-[#00629B] text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.3em] shadow-xl shadow-blue-900/10 hover:bg-[#004a75] hover:-translate-y-0.5 transition-all disabled:opacity-70">
                {isLoading ? 'Creating Account...' : 'Complete Registration'}
              </button>
            </form>
          </div>

          <div className="mt-8 text-center">
            <Link to="/login" className="text-[10px] text-slate-400 hover:text-[#00629B] tracking-widest uppercase font-bold transition-colors">
              Already a member? <span className="text-[#00629B] border-b-2 border-blue-100 pb-0.5">Sign In</span>
            </Link>
          </div>
        </div>
      </div>
    </>
  );
};

export default Register;