/**
 * Servicio de autenticación
 */
import api from './api';
import type { LoginCredentials, RegisterData, AuthTokens, User } from '../types/auth';

const authService = {
  /**
   * Login de usuario
   */
  async login(credentials: LoginCredentials): Promise<AuthTokens> {
    const response = await api.post<AuthTokens>('/auth/login', credentials);
    return response.data;
  },

  /**
   * Registro de consultorio + primer usuario
   */
  async register(data: RegisterData): Promise<User> {
    const response = await api.post<User>('/auth/register', data);
    return response.data;
  },

  /**
   * Obtener usuario actual
   */
  async me(): Promise<User> {
    const response = await api.get<User>('/auth/me');
    return response.data;
  },

  /**
   * Refresh token
   */
  async refreshToken(refreshToken: string): Promise<AuthTokens> {
    const response = await api.post<AuthTokens>('/auth/refresh', {
      refresh_token: refreshToken
    });
    return response.data;
  }
};

export default authService;
