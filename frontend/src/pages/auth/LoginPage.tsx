/**
 * Página de Login
 * 
 * ¿Qué hace?
 * - Formulario de email + password
 * - Valida que los campos no estén vacíos
 * - Llama a login() del AuthContext
 * - Redirige al dashboard si es exitoso
 * - Muestra errores si falla
 */
import { useState, FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  
  // Estado del formulario
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  /**
   * Manejar submit del formulario
   */
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault(); // Prevenir recarga de página
    setError('');
    setLoading(true);

    try {
      // Llamar a login del contexto
      await login({ email, password });
      
      // Si llega aquí, el login fue exitoso
      navigate('/patients'); // Redirigir a pacientes
    } catch (err: any) {
      // Manejar errores
      if (err.response?.status === 401) {
        setError('Email o contraseña incorrectos');
      } else {
        setError('Error al iniciar sesión. Intenta de nuevo.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#051641] via-[#0F6083] to-[#2CA1B1] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-[#051641] mb-2">
            ClinicPro
          </h1>
          <p className="text-gray-600">
            Ingresa a tu consultorio
          </p>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Email */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2CA1B1] focus:border-transparent outline-none transition"
              placeholder="tu@email.com"
              disabled={loading}
            />
          </div>

          {/* Password */}
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
              Contraseña
            </label>
            <input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2CA1B1] focus:border-transparent outline-none transition"
              placeholder="••••••••"
              disabled={loading}
            />
          </div>

          {/* Error message */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          {/* Submit button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-[#0F6083] to-[#2CA1B1] text-white py-3 rounded-lg font-semibold hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Ingresando...' : 'Ingresar'}
          </button>
        </form>

        {/* Link a registro */}
        <div className="mt-6 text-center">
          <p className="text-gray-600">
            ¿No tienes cuenta?{' '}
            <Link 
              to="/register" 
              className="text-[#2CA1B1] hover:text-[#0F6083] font-semibold"
            >
              Regístrate gratis
            </Link>
          </p>
        </div>

        {/* Trial notice */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500">
            ��� 30 días de prueba gratis
          </p>
        </div>
      </div>
    </div>
  );
}
