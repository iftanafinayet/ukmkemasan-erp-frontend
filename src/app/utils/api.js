import axios from 'axios';
import { storage, getCurrentAPIConfig } from '../config/environment';

const api = axios.create({
  baseURL: getCurrentAPIConfig().baseURL,
});

// Interceptor ini wajib ada agar setiap klik "Simpan", token ikut terkirim
api.interceptors.request.use((config) => {
  const token = storage.getToken();
  if (token) {
    // Hapus tanda kutip jika ada (sering muncul dari JSON.stringify)
    const cleanToken = token.replace(/"/g, ''); 
    config.headers.Authorization = `Bearer ${cleanToken}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// Response interceptor untuk handle token expired (401)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear user data
      storage.removeToken();
      storage.removeUser();

      // Hanya redirect jika bukan di halaman public atau portal
      const isPortal = window.location.pathname.startsWith('/portal');
      const isPublic = isPortal || 
                       ['/', '/dashboard', '/login', '/register'].includes(window.location.pathname);
      
      if (!isPublic) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;