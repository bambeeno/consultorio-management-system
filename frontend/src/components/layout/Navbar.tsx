/**
 * Navbar - Barra de navegación
 */
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <nav className="bg-gradient-to-r from-[#051641] to-[#0F6083] text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-4">
            <Link to="/appointments" className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-gradient-to-br from-[#2CA1B1] to-[#B0E4E8] rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">CP</span>
              </div>
              <span className="text-xl font-bold">ClinicPro</span>
            </Link>
          </div>

          <div className="flex items-center space-x-6">
            <Link 
              to="/appointments" 
              className={`hover:text-[#B0E4E8] transition font-medium ${
                isActive('/appointments') ? 'text-[#B0E4E8] border-b-2 border-[#B0E4E8] pb-1' : ''
              }`}
            >
              ��� Turnos
            </Link>

            <Link 
              to="/patients" 
              className={`hover:text-[#B0E4E8] transition font-medium ${
                isActive('/patients') ? 'text-[#B0E4E8] border-b-2 border-[#B0E4E8] pb-1' : ''
              }`}
            >
              ��� Pacientes
            </Link>

            <Link 
              to="/medical-records" 
              className={`hover:text-[#B0E4E8] transition font-medium ${
                isActive('/medical-records') ? 'text-[#B0E4E8] border-b-2 border-[#B0E4E8] pb-1' : ''
              }`}
            >
              ��� Historias
            </Link>

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
