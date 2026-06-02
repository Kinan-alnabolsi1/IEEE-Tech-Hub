import axios from 'axios';

const BASE_URL = 'http://127.0.0.1:8000/api'; 

const apiClient = axios.create({
    baseURL: BASE_URL,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    },
});

apiClient.interceptors.request.use((config) => {
    const token = localStorage.getItem('ieee_token') || 
                  localStorage.getItem('token') || 
                  localStorage.getItem('access_token'); 
    
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
        console.log("%c [API] Token attached successfully ✅", "color: #00629B; font-weight: bold;");
    } else {
        console.warn("%c [API] NO TOKEN FOUND IN STORAGE! ❌", "color: white; background: #e11d48; padding: 2px 5px; border-radius: 4px;");
    }
    return config;
}, (error) => {
    return Promise.reject(error);
});


export const getData = (url, params) => apiClient.get(url, { params });

export const postData = (url, data) => apiClient.post(url, data);

export const putData = (url, data) => apiClient.put(url, data);

export const patchData = (url, data) => apiClient.patch(url, data);

export const updateData = (url, data) => apiClient.put(url, data);

export const deleteData = (url) => apiClient.delete(url);

export default apiClient;