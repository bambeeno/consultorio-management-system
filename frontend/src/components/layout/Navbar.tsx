/**
 * Navbar - Barra de navegación
 * Actualizado con usuario logueado y logout
 */
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  /**
   * Manejar logout
   */
  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="bg-gradient-to-r from-[#051641] to-[#0F6083] text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo y Título */}
          <div className="flex items-center space-x-4">
            <Link to="/patients" className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-gradient-to-br from-[#2CA1B1] to-[#B0E4E8] rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">CP</span>
              </div>
              <span className="text-xl font-bold">ClinicPro</span>
            </Link>
          </div>

          {/* Links de navegación */}
          <div className="flex items-center space-x-6">
            <Link 
              to="/patients" 
              className="hover:text-[#B0E4E8] transition font-medium"
            >
              Pacientes
            </Link>

            {/* Usuario logueado */}
            {user && (
              <div className="flex items-center space-x-4 border-l border-[#2CA1B1] pl-6">
                <div className="text-right">
                  <p className="text-sm font-medium">
                    {user.first_name} {user.last_name}
                  </p>
                  <p className="text-xs text-[#B0E4E8]">
                    {user.role === 'admin' ? 'Administrador' : 
                    user.role === 'doctor' ? 'Doctor' : 
                    user.role === 'secretaria' ? 'Secretaria' : 
                    user.role}
                  </p>
                </div>

                {/* Botón de Logout */}
                <button
                  onClick={handleLogout}
                  className="bg-red-500 hover:bg-red-600 px-4 py-2 rounded-lg transition font-medium text-sm"
                >
                  Salir
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
