/**
 * Configuración de Axios para llamadas al backend
 */
import axios from 'axios';

// URL del backend en producción
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
    return Promise.reject(error);
  }
);

export default api;
