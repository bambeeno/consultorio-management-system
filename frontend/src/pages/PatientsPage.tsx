/**
 * Página principal de gestión de pacientes
 */
import { useState } from 'react';
import PatientList from '../components/patients/PatientList';
import PatientForm from '../components/patients/PatientForm';
import type { Patient } from '../types/patient';

export default function PatientsPage() {
  const [showForm, setShowForm] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleNewPatient = () => {
    setSelectedPatient(null);
    setShowForm(true);
  };

  const handleEditPatient = (patient: Patient) => {
    setSelectedPatient(patient);
    setShowForm(true);
  };

  const handleSuccess = () => {
    setShowForm(false);
    setSelectedPatient(null);
    setRefreshKey((prev) => prev + 1);
  };

  const handleCancel = () => {
    setShowForm(false);
    setSelectedPatient(null);
  };

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Gestión de Pacientes
          </h1>
          <p className="mt-2 text-gray-600">
            Sistema de gestión para consultorios médicos
          </p>
        </div>

        {!showForm && (
          <div className="mb-6">
            <button
              onClick={handleNewPatient}
              className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium"
            >
              + Nuevo Paciente
            </button>
          </div>
        )}

        {showForm ? (
          <PatientForm
            patient={selectedPatient}
            onSuccess={handleSuccess}
            onCancel={handleCancel}
          />
        ) : (
          <PatientList
            onEdit={handleEditPatient}
            onRefresh={refreshKey > 0}
          />
        )}
      </div>
    </div>
  );
}
