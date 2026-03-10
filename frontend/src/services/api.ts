/**
 * Configuración de Axios
 * Actualizado con interceptor para tokens expirados
 */
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://clinicpro-backend-kgsj.onrender.com/api/v1';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para manejar errores globalmente
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    
    // Si es 401 (no autorizado), limpiar tokens y redirigir a login
    if (error.response?.status === 401) {
      localStorage.removeItem('auth_tokens');
      delete api.defaults.headers.common['Authorization'];
      
      // Solo redirigir si no estamos ya en login/register
      if (!window.location.pathname.includes('/login') && 
          !window.location.pathname.includes('/register')) {
        window.location.href = '/login';
      }
    }
    
    return Promise.reject(error);
  }
);

export default api;
