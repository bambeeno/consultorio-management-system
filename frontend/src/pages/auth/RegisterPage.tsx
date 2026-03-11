/**
 * Página de Registro
 * 
 * ¿Qué hace?
 * - Formulario para crear consultorio + primer usuario admin
 * - Valida todos los campos
 * - Llama a register() del AuthContext
 * - Hace login automático después del registro
 * - Redirige al dashboard
 */
import { useState,type SyntheticEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import type { RegisterData } from '../../types/auth';

export default function RegisterPage() {
  const navigate = useNavigate();
  const { register } = useAuth();
  
  // Estado del formulario
  const [formData, setFormData] = useState<RegisterData>({
    consultorio_nombre: '',
    consultorio_email: '',
    consultorio_telefono: '',
    first_name: '',
    last_name: '',
    email: '',
    password: ''
  });
  
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  /**
   * Actualizar campo del formulario
   */
  const handleChange = (field: keyof RegisterData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  /**
   * Manejar submit
   */
  const handleSubmit = async (e: SyntheticEvent | Event) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Validar password (mínimo 6 caracteres)
      if (formData.password.length < 6) {
        setError('La contraseña debe tener al menos 6 caracteres');
        setLoading(false);
        return;
      }

      // Llamar a register del contexto
      // Esto registra Y hace login automático
      await register(formData);
      
      // Redirigir a pacientes
      navigate('/patients');
    } catch (err: unknown) {
      // Manejar errores
      if ((err as { response?: { status: number } }).response?.status === 400) {
        setError('El email ya está registrado');
      } else {
        setError('Error al crear la cuenta. Intenta de nuevo.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#051641] via-[#0F6083] to-[#2CA1B1] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl p-8 my-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-[#051641] mb-2">
            Crear cuenta en ClinicPro
          </h1>
          <p className="text-gray-600">
            Comienza tu prueba gratuita de 30 días
          </p>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Datos del Consultorio */}
          <div className="bg-[#F8F8F9] p-6 rounded-lg">
            <h2 className="text-lg font-semibold text-[#051641] mb-4">
              Datos del Consultorio
            </h2>
            
            <div className="space-y-4">
              <div>
                <label htmlFor="consultorio_nombre" className="block text-sm font-medium text-gray-700 mb-2">
                  Nombre del Consultorio *
                </label>
                <input
                  id="consultorio_nombre"
                  type="text"
                  required
                  value={formData.consultorio_nombre}
                  onChange={(e) => handleChange('consultorio_nombre', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2CA1B1] focus:border-transparent outline-none"
                  placeholder="Ej: Clínica Dental López"
                  disabled={loading}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="consultorio_email" className="block text-sm font-medium text-gray-700 mb-2">
                    Email del Consultorio
                  </label>
                  <input
                    id="consultorio_email"
                    type="email"
                    value={formData.consultorio_email}
                    onChange={(e) => handleChange('consultorio_email', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2CA1B1] focus:border-transparent outline-none"
                    placeholder="contacto@clinica.com"
                    disabled={loading}
                  />
                </div>

                <div>
                  <label htmlFor="consultorio_telefono" className="block text-sm font-medium text-gray-700 mb-2">
                    Teléfono
                  </label>
                  <input
                    id="consultorio_telefono"
                    type="tel"
                    value={formData.consultorio_telefono}
                    onChange={(e) => handleChange('consultorio_telefono', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2CA1B1] focus:border-transparent outline-none"
                    placeholder="+595 981 123456"
                    disabled={loading}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Datos del Usuario */}
          <div className="bg-[#F8F8F9] p-6 rounded-lg">
            <h2 className="text-lg font-semibold text-[#051641] mb-4">
              Tu Cuenta de Administrador
            </h2>
            
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="first_name" className="block text-sm font-medium text-gray-700 mb-2">
                    Nombre *
                  </label>
                  <input
                    id="first_name"
                    type="text"
                    required
                    value={formData.first_name}
                    onChange={(e) => handleChange('first_name', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2CA1B1] focus:border-transparent outline-none"
                    placeholder="Juan"
                    disabled={loading}
                  />
                </div>

                <div>
                  <label htmlFor="last_name" className="block text-sm font-medium text-gray-700 mb-2">
                    Apellido *
                  </label>
                  <input
                    id="last_name"
                    type="text"
                    required
                    value={formData.last_name}
                    onChange={(e) => handleChange('last_name', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2CA1B1] focus:border-transparent outline-none"
                    placeholder="López"
                    disabled={loading}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email *
                </label>
                <input
                  id="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2CA1B1] focus:border-transparent outline-none"
                  placeholder="juan@clinica.com"
                  disabled={loading}
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                  Contraseña *
                </label>
                <input
                  id="password"
                  type="password"
                  required
                  value={formData.password}
                  onChange={(e) => handleChange('password', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2CA1B1] focus:border-transparent outline-none"
                  placeholder="Mínimo 6 caracteres"
                  disabled={loading}
                />
                <p className="text-sm text-gray-500 mt-1">
                  Mínimo 6 caracteres
                </p>
              </div>
            </div>
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
            className="w-full bg-gradient-to-r from-[#0F6083] to-[#2CA1B1] text-white py-3 rounded-lg font-semibold hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed text-lg"
          >
            {loading ? 'Creando cuenta...' : 'Crear cuenta gratis'}
          </button>
        </form>

        {/* Link a login */}
        <div className="mt-6 text-center">
          <p className="text-gray-600">
            ¿Ya tienes cuenta?{' '}
            <Link 
              to="/login" 
              className="text-[#2CA1B1] hover:text-[#0F6083] font-semibold"
            >
              Inicia sesión
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}


