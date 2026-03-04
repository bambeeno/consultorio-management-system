/**
 * Navbar principal de ClinicPro
 */
export default function Navbar() {
  return (
    <nav className="bg-gradient-to-r from-primary to-primary-light text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo y nombre */}
          <div className="flex items-center space-x-3">
            <div className="bg-white/10 p-2 rounded-lg backdrop-blur-sm">
              <svg
                className="w-8 h-8 text-secondary"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
            <div>
              <h1 className="text-xl font-bold">ClinicPro</h1>
              <p className="text-xs text-white/70">Sistema de Gestión</p>
            </div>
          </div>

          {/* Menú */}
          <div className="flex items-center space-x-6">
            <a
              href="#"
              className="text-white/90 hover:text-white transition-colors duration-200 font-medium"
            >
              Pacientes
            </a>
            <a
              href="#"
              className="text-white/70 hover:text-white transition-colors duration-200"
            >
              Turnos
            </a>
            <a
              href="#"
              className="text-white/70 hover:text-white transition-colors duration-200"
            >
              Estadísticas
            </a>
          </div>

          {/* Usuario */}
          <div className="flex items-center space-x-3">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-medium">Dr. Usuario</p>
              <p className="text-xs text-white/60">Administrador</p>
            </div>
            <div className="w-10 h-10 bg-secondary rounded-full flex items-center justify-center font-bold text-primary">
              U
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
