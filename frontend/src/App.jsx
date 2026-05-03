import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

// Layout & Auth
import DashboardLayout from './components/layout/DashboardLayout';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import Onboarding from './pages/volunteer/Onboarding'; 

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
import TasksOverview from './pages/ChapterChair/Tasks/TasksOverview';
import ChapterMembers from './pages/ChapterChair/members/ChapterMembers';

// --- Volunteer Pages ---
import MyTasks from './pages/volunteer/MyTasks';
import BrowseProjects from './pages/volunteer/BrowseProjects';
import MyApplications from './pages/volunteer/MyApplications';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const token = localStorage.getItem('ieee_token');
  let userRole = localStorage.getItem('user_role');

  if (userRole) userRole = userRole.toLowerCase().replace(/\s+/g, '_');

  if (!token) return <Navigate to="/" replace />;

  if (allowedRoles && !allowedRoles.includes(userRole)) {
    if (userRole === 'super_admin') return <Navigate to="/super-admin" replace />;
    if (userRole === 'admin') return <Navigate to="/admin" replace />;
    if (userRole === 'chapter_chair') return <Navigate to="/chapter-chair" replace />;
    if (userRole === 'volunteer') return <Navigate to="/volunteer" replace />;
    
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
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route path="/onboarding" element={
          <ProtectedRoute allowedRoles={['volunteer']}>
             <Onboarding />
          </ProtectedRoute>
        } />

        {/* 👑 Super Admin */}
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

        {/* 🏢 Admin */}
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

        {/* 🚀 Chapter Chair */}
        <Route path="/chapter-chair" element={
          <ProtectedRoute allowedRoles={['chapter_chair']}>
            <DashboardLayout role="chapter_chair" />
          </ProtectedRoute>
        }>
          <Route index element={<ChapterDashboard />} />
          <Route path="projects" element={<ProjectsManagement />} />
          <Route path="tasks" element={<TasksOverview />} />
          <Route path="members" element={<ChapterMembers />} />
        </Route>

        {/* 🦾 Volunteer */}
        <Route path="/volunteer" element={
          <ProtectedRoute allowedRoles={['volunteer']}>
            <DashboardLayout role="volunteer" />
          </ProtectedRoute>
        }>
          {/* التعديل هنا: توجيه تلقائي لصفحة المهام لضمان تفعيل السايد بار */}
          <Route index element={<Navigate to="/volunteer/tasks" replace />} /> 
          <Route path="tasks" element={<MyTasks />} />
          <Route path="explore" element={<BrowseProjects />} />
          <Route path="applications" element={<MyApplications />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;