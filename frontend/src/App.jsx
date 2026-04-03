import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

// استيراد الصفحات (تأكدي من صحة المسارات عندك)
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import SuperAdminDashboard from './pages/super-admin/SuperAdminDashboard';
import AdminDashboard from './pages/admin/AdminDashboard';

// 1. مكون حماية المسارات (عنصر الحارس)
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('ieee_token');
  
  // إذا لم يوجد توكن، يتم توجيهه فوراً للـ Login
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  
  return children;
};

function App() {
  return (
    <Router>
      {/* مكون التوستر لإظهار الرسائل في كل التطبيق */}
      <Toaster position="top-center" reverseOrder={false} />

      <Routes>
        {/* المسارات العامة (متاحة للجميع) */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* المسارات المحمية (ممنوع الدخول بدون Login) */}
        <Route 
          path="/super-admin" 
          element={
            <ProtectedRoute>
              <SuperAdminDashboard />
            </ProtectedRoute>
          } 
        />

        <Route 
          path="/admin" 
          element={
            <ProtectedRoute>
              <AdminDashboard />
            </ProtectedRoute>
          } 
        />

        {/* إعادة توجيه أي رابط خطأ إلى Login أو الصفحة الرئيسية */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}

export default App;