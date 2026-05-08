import React, { useState, useEffect } from 'react';
import { postData } from '../../api/apiMethods'; 
import { branchService } from '../../services/branchService'; 
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import Loader from '../../components/ui/Loader'; 
import { Eye, EyeOff, ChevronDown, MapPin } from 'lucide-react';
import logo from "../../assets/IEEELogo4-removebg-preview.png";

const Register = () => {
  const navigate = useNavigate();
  const [role, setRole] = useState('Volunteer'); 
  const [isLoading, setIsLoading] = useState(false);
  
  const [allBranches, setAllBranches] = useState([]); 
  const [displayBranches, setDisplayBranches] = useState([]); 
  const [isFetchingBranches, setIsFetchingBranches] = useState(true);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const [formData, setFormData] = useState({
    username: '',
    full_name: '',
    email: '',
    ieee_membership_number: '',
    password: '',
    password_confirmation: '', 
    branch_id: '', 
  });

  useEffect(() => {
    const token = localStorage.getItem('ieee_token');
    if (token) navigate('/admin');
  }, [navigate]);

  useEffect(() => {
    const fetchBranches = async () => {
      try {
        const response = await branchService.getAll();
        
        let branchesData = [];
        if (Array.isArray(response)) branchesData = response;
        else if (Array.isArray(response?.data)) branchesData = response.data;
        else if (Array.isArray(response?.data?.data)) branchesData = response.data.data;
        
        setAllBranches(branchesData);
      } catch (error) {
        console.error("Error fetching branches:", error);
      } finally {
        setIsFetchingBranches(false);
      }
    };
    fetchBranches();
  }, []);

  useEffect(() => {
    if (role === 'Admin') {
      const availableForAdmins = allBranches.filter(branch => !branch.admin_id);
      setDisplayBranches(availableForAdmins);
      
      if (formData.branch_id) {
         const stillValid = availableForAdmins.some(b => (b.id || b.branch_id) === formData.branch_id);
         if (!stillValid) setFormData(prev => ({ ...prev, branch_id: '' }));
      }
    } else {
      setDisplayBranches(allBranches);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [role, allBranches]);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const isPasswordStrong = (password) => {
    const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]{8,}$/;
    return strongPasswordRegex.test(password);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.branch_id) {
      toast.error('Please select a branch to join.', { duration: 3000 });
      return;
    }

    if (formData.password !== formData.password_confirmation) {
      toast.error('Passwords do not match. Please try again.', { duration: 3000 });
      return;
    }

    if (!isPasswordStrong(formData.password)) {
      toast.error('Password must be at least 8 characters, include an uppercase letter, a number, and a special character (!@#$&*).', { duration: 5000 });
      return;
    }

    setIsLoading(true);

    try {
      const payload = {
        username: formData.username,
        email: formData.email,
        password: formData.password,
        password_confirmation: formData.password_confirmation,
        full_name: formData.full_name, 
        role: role === 'Admin' ? 'Branch Admin' : role, 
        ieee_membership_number: formData.ieee_membership_number,
        branch_id: Number(formData.branch_id), 
      };

      await postData('/register', payload);
      
      // 🌟 التعديل هنا: توجيه المستخدم لصفحة الـ OTP وحفظ الإيميل
      localStorage.setItem('temp_email', formData.email);
      toast.success('Registration Successful! Please verify your email.', { duration: 4000 });
      setTimeout(() => navigate('/verify-otp'), 1500);

    } catch (err) {
      toast.error(err.response?.data?.message || 'Error creating account');
    } finally {
      setIsLoading(false);
    }
  };

  const selectedBranch = allBranches.find(b => (b.id || b.branch_id) === formData.branch_id);

  return (
    <>
      {isLoading && <Loader message="Creating Account..." />}
      <div className="h-screen w-full flex items-center justify-center bg-[#fcfcfd] font-sans selection:bg-blue-100 overflow-hidden relative">
        <div className="absolute inset-0 z-0 pointer-events-none">
          <div className="absolute top-[-10%] left-1/4 w-[500px] h-[500px] bg-blue-50/50 rounded-full blur-[100px]"></div>
          <div className="absolute bottom-[-10%] right-1/4 w-[400px] h-[400px] bg-indigo-50/30 rounded-full blur-[100px]"></div>
        </div>
        
        <div className="relative z-10 w-full max-w-[480px] px-6 mt-4 ">
          <div className="flex flex-col items-center mb-4">
            <img className='w-10 mb-3' src={logo} alt="IEEE Logo"/>
            <h1 className="text-xl font-light text-slate-900 tracking-[0.15em] uppercase text-center">
              IEEE <span className="font-semibold text-[#00629B]">Tech-Hub</span>
            </h1>
          </div>
          
          <div className="bg-white p-8 rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.02)] border border-slate-50">
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
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Username</label>
                  <input name="username" type="text" required placeholder="" className="w-full bg-slate-50 border-none rounded-xl px-4 py-3 text-xs outline-none focus:ring-2 focus:ring-blue-100 transition-all" onChange={handleInputChange} />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Full Name</label>
                  <input name="full_name" type="text" required placeholder="" className="w-full bg-slate-50 border-none rounded-xl px-4 py-3 text-xs outline-none focus:ring-2 focus:ring-blue-100 transition-all" onChange={handleInputChange} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Email Address</label>
                  <input name="email" type="email" required placeholder="" className="w-full bg-slate-50 border-none rounded-xl px-4 py-3 text-xs outline-none focus:ring-2 focus:ring-blue-100 transition-all" onChange={handleInputChange} />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Member ID</label>
                  <input name="ieee_membership_number" type="text" required placeholder="" className="w-full bg-slate-50 border-none rounded-xl px-4 py-3 text-xs outline-none focus:ring-2 focus:ring-blue-100 transition-all" onChange={handleInputChange} />
                </div>
              </div>

              {/* Custom Dropdown */}
              <div className="space-y-1.5 relative z-20">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Target Branch</label>
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className={`w-full bg-slate-50 border-none rounded-xl px-4 py-3 text-xs font-bold outline-none focus:ring-2 focus:ring-blue-100 transition-all flex justify-between items-center ${selectedBranch ? 'text-slate-800' : 'text-slate-400'}`}
                  >
                    <div className="flex items-center gap-2 truncate">
                      {selectedBranch && <MapPin className="w-3.5 h-3.5 text-[#00629B]" />}
                      <span className="truncate">
                        {isFetchingBranches ? 'Loading branches...' : (selectedBranch ? selectedBranch.name : 'Select the branch you wish to join...')}
                      </span>
                    </div>
                    <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-300 ${isDropdownOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {isDropdownOpen && (
                    <>
                      <div className="fixed inset-0 z-30" onClick={() => setIsDropdownOpen(false)}></div>
                      
                      <div className="absolute z-40 w-full mt-2 bg-white border border-slate-100 rounded-xl shadow-[0_10px_40px_rgba(0,0,0,0.08)] py-2 max-h-48 overflow-y-auto animate-in fade-in zoom-in-95 duration-200">
                        {displayBranches.length > 0 ? (
                          displayBranches.map((branch) => {
                            const bId = branch.id || branch.branch_id;
                            const bName = branch.name || branch.title || `Branch ${bId}`;

                            return (
                              <button
                                key={bId}
                                type="button"
                                onClick={() => {
                                  setFormData({ ...formData, branch_id: bId });
                                  setIsDropdownOpen(false);
                                }}
                                className={`w-full text-left px-4 py-2.5 text-xs font-bold transition-colors flex items-center gap-2 hover:bg-blue-50/50 hover:text-[#00629B] ${formData.branch_id === bId ? 'bg-blue-50 text-[#00629B]' : 'text-slate-600'}`}
                              >
                                {formData.branch_id === bId && <div className="w-1.5 h-1.5 rounded-full bg-[#00629B]"></div>}
                                {bName}
                              </button>
                            );
                          })
                        ) : (
                          <div className="px-4 py-3 text-xs text-slate-400 font-medium text-center">
                            {role === 'Admin' ? 'No branches available for new admins.' : 'No branches available currently.'}
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </div>
              </div>

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
                {isLoading ? 'Processing...' : 'Submit Request'}
              </button>
            </form>
          </div>

          <div className="mt-6 text-center pb-4">
            <Link to="/" className="text-[10px] text-slate-400 hover:text-[#00629B] tracking-widest uppercase font-bold transition-colors">
              Already a member? <span className="text-[#00629B] border-b-2 border-blue-100 pb-0.5">Sign In</span>
            </Link>
          </div>
        </div>
      </div>
    </>
  );
};

export default Register;