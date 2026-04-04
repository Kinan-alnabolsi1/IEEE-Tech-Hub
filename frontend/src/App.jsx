import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

// استيراد الصفحات
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import DashboardLayout from './components/layout/DashboardLayout';

// صفحات السوبر أدمن
import SuperAdminDashboard from './pages/super-admin/SuperAdminDashboard'; 
import BranchesIndex from './pages/super-admin/branches/components/BranchesIndex'; 
import SocietiesIndex from './pages/super-admin/societies/components/SocietiesIndex'; // الاستيراد الجديد

// صفحات الأدمن
import AdminDashboard from './pages/admin/AdminDashboard';

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('ieee_token');
  if (!token) return <Navigate to="/login" replace />;
  return children;
};

function App() {
  return (
    <Router>
      <Toaster position="top-center" />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* مسارات السوبر أدمن */}
        <Route 
          path="/super-admin" 
          element={
            <ProtectedRoute>
              <DashboardLayout role="super_admin" />
            </ProtectedRoute>
          }
        >
          <Route index element={<SuperAdminDashboard />} />
          <Route path="branches" element={<BranchesIndex />} />
          
          {/* مسار إدارة الجمعيات الجديد */}
          <Route path="societies" element={<SocietiesIndex />} />
          
          <Route path="admins" element={<div className="p-10 font-bold">Admins Control Page Coming Soon...</div>} />
        </Route>

        {/* مسارات الأدمن العادي */}
        <Route 
          path="/admin" 
          element={
            <ProtectedRoute>
              <DashboardLayout role="admin" />
            </ProtectedRoute>
          }
        >
          <Route index element={<AdminDashboard />} />
        </Route>

        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}

export default App;