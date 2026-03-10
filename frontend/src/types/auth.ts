/**
 * Tipos para autenticación
 */

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  consultorio_nombre: string;
  consultorio_email?: string;
  consultorio_telefono?: string;
  first_name: string;
  last_name: string;
  email: string;
  password: string;
}

export interface AuthTokens {
  access_token: string;
  refresh_token: string;
  token_type: string;
}

export interface User {
  id: number;
  consultorio_id: number;
  first_name: string;
  last_name: string;
  email: string;
  role: 'super_admin' | 'admin' | 'doctor' | 'secretaria' | 'contador';
  is_active: boolean;
}

export interface AuthContextType {
  user: User | null;
  tokens: AuthTokens | null;
  loading: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}
