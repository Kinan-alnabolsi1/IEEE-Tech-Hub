import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

// Layout
import DashboardLayout from './components/layout/DashboardLayout';

// Auth
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';

// --- Super Admin Pages ---
import SuperAdminDashboard from './pages/super-admin/SuperAdminDashboard'; 
import BranchesIndex from './pages/super-admin/branches/components/BranchesIndex'; 
import SocietiesIndex from './pages/super-admin/societies/components/SocietiesIndex';
import AdminsManagement from './pages/super-admin/admins/AdminsManagement';
import SystemReports from './pages/super-admin/reports/SystemReports';

// --- Admin Pages ---
import AdminDashboard from './pages/admin/dashboard/AdminDashboard'; // الصفحة 1
import VolunteerMemberships from './pages/admin/volunteers/VolunteerMemberships'; // الصفحة 2

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('ieee_token');
  if (!token) return <Navigate to="/" replace />;
  return children;
};

function App() {
  return (
    <Router>
      <Toaster 
        position="top-center" 
        toastOptions={{
          style: {
            borderRadius: '20px',
            background: '#1e293b',
            color: '#fff',
            fontSize: '11px',
            fontWeight: 'bold',
          },
        }} 
      />
      
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* --- Super Admin Panel --- */}
        <Route 
          path="/super-admin" 
          element={
            <ProtectedRoute>
              <DashboardLayout role="super_admin" />
            </ProtectedRoute>
          }
        >
          <Route index element={<SuperAdminDashboard />} />
          <Route path="admins" element={<AdminsManagement />} />
          <Route path="branches" element={<BranchesIndex />} />
          <Route path="societies" element={<SocietiesIndex />} />
          <Route path="reports" element={<SystemReports />} />
        </Route>

        {/* --- Branch Admin Panel --- */}
        <Route 
          path="/admin" 
          element={
            <ProtectedRoute>
              <DashboardLayout role="admin" />
            </ProtectedRoute>
          }
        >
          {/* الصفحة 1: Dashboard */}
          <Route index element={<AdminDashboard />} />
          
          {/* الصفحة 2: إدارة العضويات والمتطوعين */}
          <Route path="volunteers" element={<VolunteerMemberships />} />
          
          {/* ملاحظة: باقي الصفحات (chapters, projects, reports) بنضيفهم بنفس الطريقة بس نكتب كودهم */}
        </Route>

        <Route path="/" element={<Navigate to="/" replace />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;