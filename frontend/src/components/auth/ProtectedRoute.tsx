/**
 * ProtectedRoute - Protege rutas que requieren autenticación
 * 
 * ¿Qué hace?
 * - Verifica si hay un usuario logueado
 * - Si NO → Redirige a /login
 * - Si SÍ → Muestra el contenido (children)
 * - Mientras carga → Muestra loading
 */
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isAuthenticated, loading } = useAuth();

  // Mientras carga, mostrar loading
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8F8F9]">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#2CA1B1] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando...</p>
        </div>
      </div>
    );
  }

  // Si no está autenticado, redirigir a login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Si está autenticado, mostrar el contenido
  return <>{children}</>;
}
