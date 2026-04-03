import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
    const token = localStorage.getItem('ieee_token');

    // إذا مافي توكن، منرجعه للـ login
    if (!token) {
        return <Navigate to="/login" replace />;
    }

    // إذا في توكن، بنخليه يشوف الصفحة (الأبناء)
    return children;
};

export default ProtectedRoute;