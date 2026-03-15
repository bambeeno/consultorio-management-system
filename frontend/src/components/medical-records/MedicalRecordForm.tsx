import { useState, useEffect, FormEvent } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import patientService from '../../services/patientService';
import type { MedicalRecord, MedicalRecordCreate } from '../../types/medicalRecord';
import type { Patient } from '../../types/patient';

interface MedicalRecordFormProps {
  record?: MedicalRecord | null;
  onSubmit: (data: MedicalRecordCreate) => Promise<void>;
  onClose: () => void;
}

export default function MedicalRecordForm({
  record,
  onSubmit,
  onClose
}: MedicalRecordFormProps) {
  const { user } = useAuth();
  
  const [patients, setPatients] = useState<Patient[]>([]);
  const [consultationDateLocal, setConsultationDateLocal] = useState('');
  
  const [formData, setFormData] = useState<Omit<MedicalRecordCreate, 'consultation_date'>>({
    patient_id: record?.patient_id || 0,
    chief_complaint: record?.chief_complaint || '',
    symptoms: record?.symptoms || '',
    diagnosis: record?.diagnosis || '',
    treatment: record?.treatment || '',
    notes: record?.notes || '',
    blood_pressure: record?.blood_pressure || '',
    heart_rate: record?.heart_rate || undefined,
    temperature: record?.temperature || undefined,
    weight: record?.weight || undefined,
    height: record?.height || undefined
  });
  
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const formatDatetimeLocal = (isoString: string): string => {
    const date = new Date(isoString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  const datetimeLocalToISO = (datetimeLocal: string): string => {
    return `${datetimeLocal}:00.000Z`;
  };

  useEffect(() => {
    if (record?.consultation_date) {
      setConsultationDateLocal(formatDatetimeLocal(record.consultation_date));
    } else {
      const now = new Date();
      setConsultationDateLocal(formatDatetimeLocal(now.toISOString()));
    }
  }, [record]);

  useEffect(() => {
    const loadPatients = async () => {
      try {
        const data = await patientService.getAll();
        setPatients(data);
      } catch (err) {
        console.error('Error loading patients:', err);
      }
    };
    loadPatients();
  }, []);

  const handleChange = (field: keyof typeof formData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (!formData.patient_id) {
        setError('Selecciona un paciente');
        setLoading(false);
        return;
      }

      if (!formData.diagnosis) {
        setError('El diagnostico es obligatorio');
        setLoading(false);
        return;
      }

      if (!consultationDateLocal) {
        setError('Selecciona la fecha de consulta');
        setLoading(false);
        return;
      }

      const recordData: MedicalRecordCreate = {
        ...formData,
        consultation_date: datetimeLocalToISO(consultationDateLocal)
      };

      await onSubmit(recordData);
    } catch (err: any) {
      setError('Error al guardar la historia clinica. Intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl my-8">
        <div className="bg-gradient-to-r from-[#051641] to-[#0F6083] text-white p-6 sticky top-0 rounded-t-2xl">
          <h2 className="text-2xl font-bold">
            {record ? 'Editar Historia Clinica' : 'Nueva Historia Clinica'}
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[calc(100vh-200px)] overflow-y-auto">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Paciente *
              </label>
              <select
                required
                value={formData.patient_id}
                onChange={(e) => handleChange('patient_id', parseInt(e.target.value))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2CA1B1] focus:border-transparent outline-none"
                disabled={loading}
              >
                <option value="">Seleccionar paciente</option>
                {patients.map(patient => (
                  <option key={patient.id} value={patient.id}>
                    {patient.first_name} {patient.last_name} - CI: {patient.ci}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Fecha de Consulta *
              </label>
              <input
                type="datetime-local"
                required
                value={consultationDateLocal}
                onChange={(e) => setConsultationDateLocal(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2CA1B1] focus:border-transparent outline-none"
                disabled={loading}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Motivo de Consulta
              </label>
              <input
                type="text"
                value={formData.chief_complaint}
                onChange={(e) => handleChange('chief_complaint', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2CA1B1] focus:border-transparent outline-none"
                placeholder="Ej: Dolor de cabeza"
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sintomas
              </label>
              <input
                type="text"
                value={formData.symptoms}
                onChange={(e) => handleChange('symptoms', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2CA1B1] focus:border-transparent outline-none"
                placeholder="Ej: Cefalea intensa, mareos"
                disabled={loading}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Diagnostico *
            </label>
            <textarea
              required
              value={formData.diagnosis}
              onChange={(e) => handleChange('diagnosis', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2CA1B1] focus:border-transparent outline-none"
              rows={2}
              placeholder="Diagnostico medico"
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tratamiento
            </label>
            <textarea
              value={formData.treatment}
              onChange={(e) => handleChange('treatment', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2CA1B1] focus:border-transparent outline-none"
              rows={2}
              placeholder="Medicacion prescrita, indicaciones"
              disabled={loading}
            />
          </div>

          <div className="bg-[#F8F8F9] p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-[#051641] mb-4">Signos Vitales</h3>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Presion
                </label>
                <input
                  type="text"
                  value={formData.blood_pressure}
                  onChange={(e) => handleChange('blood_pressure', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2CA1B1] outline-none"
                  placeholder="120/80"
                  disabled={loading}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Pulso (bpm)
                </label>
                <input
                  type="number"
                  value={formData.heart_rate || ''}
                  onChange={(e) => handleChange('heart_rate', e.target.value ? parseInt(e.target.value) : undefined)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2CA1B1] outline-none"
                  placeholder="70"
                  disabled={loading}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Temp (C)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.temperature || ''}
                  onChange={(e) => handleChange('temperature', e.target.value ? parseFloat(e.target.value) : undefined)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2CA1B1] outline-none"
                  placeholder="36.5"
                  disabled={loading}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Peso (kg)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.weight || ''}
                  onChange={(e) => handleChange('weight', e.target.value ? parseFloat(e.target.value) : undefined)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2CA1B1] outline-none"
                  placeholder="70"
                  disabled={loading}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Altura (cm)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.height || ''}
                  onChange={(e) => handleChange('height', e.target.value ? parseFloat(e.target.value) : undefined)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2CA1B1] outline-none"
                  placeholder="170"
                  disabled={loading}
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notas Adicionales
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => handleChange('notes', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2CA1B1] focus:border-transparent outline-none"
              rows={3}
              placeholder="Observaciones, indicaciones especiales"
              disabled={loading}
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          <div className="flex gap-3 pt-4 sticky bottom-0 bg-white pb-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition"
              disabled={loading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-gradient-to-r from-[#0F6083] to-[#2CA1B1] text-white px-6 py-3 rounded-lg font-semibold hover:opacity-90 transition disabled:opacity-50"
            >
              {loading ? 'Guardando...' : record ? 'Actualizar' : 'Crear Historia'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
