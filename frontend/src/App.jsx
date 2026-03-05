import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/auth/Login'
import Register from './pages/auth/Register'

const App = () => {
  return (
    <Router>
      <Routes>
        {/* المسار الافتراضي يوجهنا لصفحة اللوجن */}
        <Route path="/" element={<Navigate to="/login" />} />
        
        {/* مسار صفحة تسجيل الدخول */}
        <Route path="/login" element={<Login />} />
        
        {/* مسار صفحة إنشاء حساب جديد */}
        <Route path="/register" element={<Register />} />
        
      </Routes>
    </Router>
  )
}

export default App