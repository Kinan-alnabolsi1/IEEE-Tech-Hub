import axios from 'axios';

// رابط السيرفر الأساسي (تأكدي أنه يعمل)
const BASE_URL = 'http://127.0.0.1:8000/api'; 

const apiClient = axios.create({
    baseURL: BASE_URL,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    },
});

// إعداد "اعتراض الطلبات" لإضافة الهوية (Token) تلقائياً
apiClient.interceptors.request.use((config) => {
    // جلب التوكن بالاسم المستخدم في ملف الـ Login الخاص بك
    const token = localStorage.getItem('ieee_token') || 
                  localStorage.getItem('token') || 
                  localStorage.getItem('access_token'); 
    
    if (token) {
        // إضافة التوكن للهيدرز في كل طلب يخرج من الفرونت إند
        config.headers.Authorization = `Bearer ${token}`;
        console.log("%c [API] Token attached successfully ✅", "color: #00629B; font-weight: bold;");
    } else {
        // تنبيه في حال كان المستخدم غير مسجل دخول
        console.warn("%c [API] NO TOKEN FOUND IN STORAGE! ❌", "color: white; background: #e11d48; padding: 2px 5px; border-radius: 4px;");
    }
    return config;
}, (error) => {
    return Promise.reject(error);
});

// --- الدوال الأساسية المصدرة للمشروع ---

// 1. جلب البيانات (Read)
export const getData = (url, params) => apiClient.get(url, { params });

// 2. إضافة بيانات جديدة (Create)
export const postData = (url, data) => apiClient.post(url, data);

// 3. تعديل البيانات (Update/Replace)
export const putData = (url, data) => apiClient.put(url, data);

// 4. تعديل جزئي (Patch)
export const patchData = (url, data) => apiClient.patch(url, data);

// 5. تحديث (مسمى إضافي لمنع أخطاء الـ Syntax في بعض الملفات)
export const updateData = (url, data) => apiClient.put(url, data);

// 6. حذف البيانات (Delete)
export const deleteData = (url) => apiClient.delete(url);

export default apiClient;