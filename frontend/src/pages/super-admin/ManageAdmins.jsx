import React, { useState, useEffect } from 'react';

const ManageAdmins = () => {
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);

  // دالة جلب البيانات (جاهزة للربط مع API)
  const fetchAdmins = async () => {
    try {
      setLoading(true);
      // هنا سيتم وضع رابط الـ API الخاص بك لاحقاً
      // const response = await axios.get('/api/super/admins');
      // setAdmins(response.data);
      
      // بيانات تجريبية بناءً على الـ Use Case
      const mockData = [
        { id: 1, name: "Samer AIU", branch: "AIU Student Branch", status: "Active", email: "samer@aiu.edu" },
        { id: 2, name: "Lina Damascus", branch: "Damascus University", status: "Suspended", email: "lina@ieee.org" }
      ];
      setAdmins(mockData);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdmins();
  }, []);

  return (
    <div className="space-y-6 animate-in fade-in duration-700">
      {/* Header مع زر الإضافة */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-50">
        <div>
          <h2 className="text-xl font-black text-slate-800 uppercase tracking-tight italic">Manage Branch Admins</h2>
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em] mt-1">Control access for chapter & branch chairs</p>
        </div>
        <button className="bg-[#00629B] text-white px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-blue-100 hover:scale-105 transition-transform">
          + Register New Admin
        </button>
      </div>

      {/* الجدول الاحترافي */}
      <div className="bg-white rounded-[3rem] shadow-xl border border-slate-50 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 text-slate-300 uppercase text-[9px] font-black tracking-widest border-b border-slate-50">
                <th className="p-8">Admin Details</th>
                <th className="p-8">Assigned Branch</th>
                <th className="p-8 text-center">Status</th>
                <th className="p-8 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {admins.map((admin) => (
                <tr key={admin.id} className="hover:bg-blue-50/30 transition-all group">
                  <td className="p-8">
                    <p className="text-sm font-bold text-slate-700">{admin.name}</p>
                    <p className="text-[10px] text-slate-400 font-medium">{admin.email}</p>
                  </td>
                  <td className="p-8">
                    <span className="text-[10px] font-black uppercase text-[#00629B] bg-blue-50 px-4 py-1.5 rounded-xl italic">
                      {admin.branch}
                    </span>
                  </td>
                  <td className="p-8 text-center">
                    <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-tighter ${
                      admin.status === 'Active' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-500'
                    }`}>
                      {admin.status}
                    </span>
                  </td>
                  <td className="p-8 text-right space-x-2">
                    <button className="text-[10px] font-black text-slate-400 hover:text-blue-600 uppercase tracking-tighter">Edit</button>
                    <button className="text-[10px] font-black text-red-300 hover:text-red-600 uppercase tracking-tighter">
                      {admin.status === 'Active' ? 'Suspend' : 'Activate'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ManageAdmins;