/**
 * Página principal de gestión de pacientes - ClinicPro
 */
import { useState } from 'react';
import Layout from '../components/layout/Layout';
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
    <Layout>
      {/* Header de la sección */}
      <div className="mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-primary">
              Gestión de Pacientes
            </h1>
            <p className="mt-2 text-gray-600">
              Administra la información de tus pacientes
            </p>
          </div>

          {!showForm && (
            <button
              onClick={handleNewPatient}
              className="flex items-center space-x-2 px-6 py-3 bg-secondary text-white rounded-lg hover:bg-secondary/90 transition-all duration-200 shadow-md hover:shadow-lg font-medium"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
              <span>Nuevo Paciente</span>
            </button>
          )}
        </div>
      </div>

      {/* Contenido */}
      {showForm ? (
        <PatientForm
          patient={selectedPatient}
          onSuccess={handleSuccess}
          onCancel={handleCancel}
        />
      ) : (
        <PatientList onEdit={handleEditPatient} onRefresh={refreshKey > 0} />
      )}
    </Layout>
  );
}
