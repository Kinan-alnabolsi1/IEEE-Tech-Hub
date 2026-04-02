import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// صفحات الـ Auth
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';

// الصفحات الحاضنة (Containers) - هي التي تحتوي الآن على النافبار والسايدبار
import SuperAdminDashboard from './pages/super-admin/SuperAdminDashboard';
import AdminDashboard from './pages/admin/AdminDashboard';

// صفحات المحتوى (Content) - سننشئها لاحقاً، حالياً سنضع مكونات مؤقتة
const Placeholder = ({ text }) => (
  <div className="p-8 bg-white rounded-[2rem] shadow-sm border border-slate-100 font-bold text-slate-400 uppercase tracking-widest text-center animate-pulse">
    {text} (Coming Soon)
  </div>
);

const App = () => {
  return (
    <Router>
      <Routes>
        {/* 1. المسارات العامة */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* 2. مسارات السوبر أدمن - لم نعد بحاجة لـ DashboardLayout هنا */}
        <Route path="/super-admin" element={<SuperAdminDashboard />}>
          {/* الصفحة التي تظهر عند الدخول لـ /super-admin مباشرة */}
          <Route index element={<Placeholder text="Super Admin Stats Overview" />} />
          
          {/* الصفحات التي ستنشئينها لاحقاً بقلب السايد بار */}
          <Route path="admins" element={<Placeholder text="Manage All Admins" />} />
          <Route path="branches" element={<Placeholder text="IEEE Branches List" />} />
        </Route>

        {/* 3. مسارات الأدمن (مدير الفرع) */}
        <Route path="/admin" element={<AdminDashboard />}>
          {/* الصفحة الرئيسية للفرع */}
          <Route index element={<Placeholder text="Branch Performance Dashboard" />} />
          
          {/* الصفحات الفرعية للأدمن */}
          <Route path="volunteers" element={<Placeholder text="Volunteers Directory" />} />
          <Route path="events" element={<Placeholder text="Events Planner" />} />
        </Route>

        {/* 4. معالجة المسارات الخاطئة */}
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="*" element={
          <div className="h-screen flex items-center justify-center font-black text-slate-300 uppercase tracking-[0.5em]">
            404 | NOT FOUND
          </div>
        } />
      </Routes>
    </Router>
  );
};

export default App;