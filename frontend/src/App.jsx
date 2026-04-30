import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

// Layout & Auth
import DashboardLayout from './components/layout/DashboardLayout';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';

// --- Super Admin Pages ---
import SuperAdminDashboard from './pages/super-admin/SuperAdminDashboard'; 
import BranchesIndex from './pages/super-admin/branches/components/BranchesIndex'; 
import SocietiesIndex from './pages/super-admin/societies/components/SocietiesIndex';
import AdminsManagement from './pages/super-admin/admins/AdminsManagement';

// --- Admin Pages ---
import AdminDashboard from './pages/admin/dashboard/AdminDashboard'; 
import VolunteerMemberships from './pages/admin/volunteers/VolunteerMemberships'; 
import ChaptersIndex from './pages/admin/chapters/ChaptersIndex';
import ProjectsIndex from './pages/admin/projects/ProjectsIndex';

// --- Chapter Chair Pages ---
import ChapterDashboard from './pages/chapterChair/Dashboard/ChapterDashboard';
import ProjectsManagement from './pages/chapterChair/Projects/ProjectsManagement';
// استدعي باقي صفحات التشابتر هون بس تصمميهم

const ProtectedRoute = ({ children, allowedRoles }) => {
  const token = localStorage.getItem('ieee_token');
  let userRole = localStorage.getItem('user_role');

  if (userRole) userRole = userRole.toLowerCase().replace(/\s+/g, '_');

  // إذا مافي توكن، طرده للوجن
  if (!token) return <Navigate to="/" replace />;

  // إذا عنده توكن بس عم يحاول يفوت على مسار مو من صلاحياته
  if (allowedRoles && !allowedRoles.includes(userRole)) {
    // التوجيه الصارم للمكان الصحيح بناءً على رتبته
    if (userRole === 'super_admin') return <Navigate to="/super-admin" replace />;
    if (userRole === 'chapter_chair') return <Navigate to="/chapter-chair" replace />;
    if (userRole === 'admin') return <Navigate to="/admin" replace />;
    
    // إذا رتبته مو معروفة، بننظف المتصفح وبنرجعه يسجل دخول
    localStorage.clear();
    return <Navigate to="/" replace />;
  }

  return children;
};

function App() {
  return (
    <Router>
      <Toaster 
        position="top-center" 
        toastOptions={{
          style: { fontSize: '12px', fontWeight: 'bold', borderRadius: '12px' }
        }} 
      />
      <Routes>
        {/* المسارات العامة */}
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* 👑 مسارات السوبر أدمن */}
        <Route path="/super-admin" element={
          <ProtectedRoute allowedRoles={['super_admin']}>
            <DashboardLayout role="super_admin" />
          </ProtectedRoute>
        }>
          <Route index element={<SuperAdminDashboard />} />
          <Route path="admins" element={<AdminsManagement />} />
          <Route path="branches" element={<BranchesIndex />} />
          <Route path="societies" element={<SocietiesIndex />} />
        </Route>

        {/* 🏢 مسارات مدير الفرع (Admin) */}
        <Route path="/admin" element={
          <ProtectedRoute allowedRoles={['admin']}>
            <DashboardLayout role="admin" />
          </ProtectedRoute>
        }>
          <Route index element={<AdminDashboard />} />
          <Route path="volunteers" element={<VolunteerMemberships />} />
          <Route path="chapters" element={<ChaptersIndex />} />
          <Route path="projects" element={<ProjectsIndex />} />
        </Route>

        {/* 🚀 مسارات رئيس الفصل (Chapter Chair) */}
        <Route path="/chapter-chair" element={
          <ProtectedRoute allowedRoles={['chapter_chair']}>
            <DashboardLayout role="chapter_chair" />
          </ProtectedRoute>
        }>
          <Route index element={<ChapterDashboard />} />
          <Route path="projects" element={<ProjectsManagement />} />
          
          {/* الصفحات الجاية (بس تجهزيها شيلي التعليق عنها) */}
          {/* <Route path="applications" element={<ApplicationsPage />} /> */}
          {/* <Route path="members" element={<MembersPage />} /> */}
          {/* <Route path="tasks" element={<TasksPage />} /> */}
        </Route>

        {/* Catch All - أي مسار غلط بيرجعه للوجن */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;