/**
 * Context de autenticación
 * Maneja el estado global de autenticación
 */
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import authService from '../services/authService';
import api from '../services/api';
import type { 
  AuthContextType, 
  LoginCredentials, 
  RegisterData, 
  AuthTokens, 
  User 
} from '../types/auth';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [tokens, setTokens] = useState<AuthTokens | null>(null);
  const [loading, setLoading] = useState(true);

  /**
   * Cargar tokens y usuario desde localStorage al iniciar
   */
  useEffect(() => {
    const loadStoredAuth = async () => {
      try {
        const storedTokens = localStorage.getItem('auth_tokens');
        
        if (storedTokens) {
          const parsedTokens: AuthTokens = JSON.parse(storedTokens);
          setTokens(parsedTokens);
          
          // Configurar token en axios
          api.defaults.headers.common['Authorization'] = `Bearer ${parsedTokens.access_token}`;
          
          // Obtener datos del usuario
          const userData = await authService.me();
          setUser(userData);
        }
      } catch (error) {
        console.error('Error loading auth:', error);
        // Si falla, limpiar tokens
        localStorage.removeItem('auth_tokens');
        delete api.defaults.headers.common['Authorization'];
      } finally {
        setLoading(false);
      }
    };

    loadStoredAuth();
  }, []);

  /**
   * Login
   */
  const login = async (credentials: LoginCredentials) => {
    try {
      // Obtener tokens
      const authTokens = await authService.login(credentials);
      
      // Guardar en estado y localStorage
      setTokens(authTokens);
      localStorage.setItem('auth_tokens', JSON.stringify(authTokens));
      
      // Configurar token en axios
      api.defaults.headers.common['Authorization'] = `Bearer ${authTokens.access_token}`;
      
      // Obtener datos del usuario
      const userData = await authService.me();
      setUser(userData);
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  /**
   * Register
   */
  const register = async (data: RegisterData) => {
    try {
      // Registrar usuario
      const userData = await authService.register(data);
      
      // Hacer login automáticamente después del registro
      await login({
        email: data.email,
        password: data.password
      });
    } catch (error) {
      console.error('Register error:', error);
      throw error;
    }
  };

  /**
   * Logout
   */
  const logout = () => {
    setUser(null);
    setTokens(null);
    localStorage.removeItem('auth_tokens');
    delete api.defaults.headers.common['Authorization'];
  };

  const value: AuthContextType = {
    user,
    tokens,
    loading,
    login,
    register,
    logout,
    isAuthenticated: !!user
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/**
 * Hook para usar el contexto de auth
 */
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
