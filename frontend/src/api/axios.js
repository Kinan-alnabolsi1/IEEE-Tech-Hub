import axios from 'axios';

const api = axios.create({
  // الرابط الأساسي للسيرفر (انسخيه من بوست مان عندك)
  baseURL: 'http://127.0.0.1:8000/api', 
});

// هذا الجزء يضيف التوكن تلقائياً لكل طلب (عشان ما تضطري تكتبيه بكل صفحة)
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('ieee_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;