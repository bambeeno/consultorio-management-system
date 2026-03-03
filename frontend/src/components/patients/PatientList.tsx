/**
 * Componente: Lista de pacientes
 */
import { useState, useEffect } from 'react';
import type { Patient } from '../../types/patient';
import patientService from '../../services/patientService';

interface PatientListProps {
  onEdit?: (patient: Patient) => void;
  onRefresh?: boolean;
}

export default function PatientList({ onEdit, onRefresh }: PatientListProps) {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Cargar pacientes
  const loadPatients = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await patientService.getAll();
      setPatients(data);
    } catch (err) {
      setError('Error al cargar pacientes');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Buscar pacientes
  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      loadPatients();
      return;
    }

    try {
      setLoading(true);
      const data = await patientService.search(searchTerm);
      setPatients(data);
    } catch (err) {
      setError('Error en la búsqueda');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Eliminar paciente
  const handleDelete = async (id: number) => {
    if (!confirm('¿Está seguro de eliminar este paciente?')) return;

    try {
      await patientService.delete(id);
      loadPatients(); // Recargar lista
    } catch (err) {
      alert('Error al eliminar paciente');
      console.error(err);
    }
  };

  useEffect(() => {
    loadPatients();
  }, [onRefresh]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-gray-600">Cargando pacientes...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
        {error}
      </div>
    );
  }

  return (
    <div>
      {/* Barra de búsqueda */}
      <div className="mb-6 flex gap-2">
        <input
          type="text"
          placeholder="Buscar por nombre o CI..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          onClick={handleSearch}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Buscar
        </button>
        {searchTerm && (
          <button
            onClick={() => {
              setSearchTerm('');
              loadPatients();
            }}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
          >
            Limpiar
          </button>
        )}
      </div>

      {/* Tabla de pacientes */}
      {patients.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          No se encontraron pacientes
        </div>
      ) : (
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Nombre
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  CI
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Teléfono
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {patients.map((patient) => (
                <tr key={patient.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {patient.first_name} {patient.last_name}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {patient.ci}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {patient.email || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {patient.phone || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                    {onEdit && (
                      <button
                        onClick={() => onEdit(patient)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        Editar
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(patient.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Total */}
      <div className="mt-4 text-sm text-gray-600">
        Total: {patients.length} paciente{patients.length !== 1 ? 's' : ''}
      </div>
    </div>
  );
}
