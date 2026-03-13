/**
 * Formulario de Turno (Modal)
 */
import { useState, useEffect, FormEvent } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import patientService from '../../services/patientService';
import type { Appointment, AppointmentCreate, AppointmentStatus } from '../../types/appointment';
import type { Patient } from '../../types/patient';

interface AppointmentFormProps {
  appointment?: Appointment | null;
  onSubmit: (data: AppointmentCreate) => Promise<void>;
  onClose: () => void;
}

export default function AppointmentForm({
  appointment,
  onSubmit,
  onClose
}: AppointmentFormProps) {
  const { user } = useAuth();
  
  const [patients, setPatients] = useState<Patient[]>([]);
  
  // Estado local para inputs (sin conversión UTC)
  const [startTimeLocal, setStartTimeLocal] = useState('');
  const [endTimeLocal, setEndTimeLocal] = useState('');
  
  const [formData, setFormData] = useState<Omit<AppointmentCreate, 'start_time' | 'end_time'>>({
    patient_id: appointment?.patient_id || 0,
    doctor_id: appointment?.doctor_id || user?.id || 0,
    reason: appointment?.reason || '',
    notes: appointment?.notes || '',
    status: appointment?.status || 'scheduled'
  });
  
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Cargar datos iniciales si estamos editando
  useEffect(() => {
    if (appointment) {
      // Convertir de UTC a local para mostrar
      const startUTC = new Date(appointment.start_time);
      const endUTC = new Date(appointment.end_time);
      
      // Formato datetime-local: YYYY-MM-DDTHH:mm
      setStartTimeLocal(formatDatetimeLocal(startUTC));
      setEndTimeLocal(formatDatetimeLocal(endUTC));
    }
  }, [appointment]);

  /**
   * Formatear Date a string datetime-local
   */
  const formatDatetimeLocal = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  /**
   * Convertir datetime-local a ISO string (lo que espera el backend)
   */
  const datetimeLocalToISO = (datetimeLocal: string): string => {
    // datetime-local ya está en la zona horaria local
    // Solo agregamos :00 para los segundos y la 'Z' para UTC
    const date = new Date(datetimeLocal);
    return date.toISOString();
  };

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

  /**
   * Manejar cambio de hora de inicio
   * Calcula automáticamente +1 hora para el fin
   */
  const handleStartTimeChange = (value: string) => {
    setStartTimeLocal(value);
    
    if (value) {
      // Calcular +1 hora automáticamente
      const start = new Date(value);
      const end = new Date(start.getTime() + 60 * 60 * 1000);
      setEndTimeLocal(formatDatetimeLocal(end));
    }
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

      if (!startTimeLocal || !endTimeLocal) {
        setError('Selecciona fecha y hora');
        setLoading(false);
        return;
      }

      const startDate = new Date(startTimeLocal);
      const endDate = new Date(endTimeLocal);

      if (endDate <= startDate) {
        setError('La hora de fin debe ser posterior a la de inicio');
        setLoading(false);
        return;
      }

      // Construir el objeto completo para enviar
      const appointmentData: AppointmentCreate = {
        ...formData,
        start_time: datetimeLocalToISO(startTimeLocal),
        end_time: datetimeLocalToISO(endTimeLocal)
      };

      await onSubmit(appointmentData);
    } catch (err: any) {
      if (err.response?.status === 409) {
        setError('Ya existe un turno en ese horario');
      } else {
        setError('Error al guardar el turno. Intenta de nuevo.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="bg-gradient-to-r from-[#051641] to-[#0F6083] text-white p-6 sticky top-0">
          <h2 className="text-2xl font-bold">
            {appointment ? 'Editar Turno' : 'Nuevo Turno'}
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
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
              Fecha y Hora de Inicio *
            </label>
            <input
              type="datetime-local"
              required
              value={startTimeLocal}
              onChange={(e) => handleStartTimeChange(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2CA1B1] focus:border-transparent outline-none"
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Fecha y Hora de Fin *
            </label>
            <input
              type="datetime-local"
              required
              value={endTimeLocal}
              onChange={(e) => setEndTimeLocal(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2CA1B1] focus:border-transparent outline-none"
              disabled={loading}
            />
            <p className="text-sm text-gray-500 mt-1">
              Duracion sugerida: 1 hora (se calcula automaticamente)
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Motivo de la Consulta
            </label>
            <input
              type="text"
              value={formData.reason}
              onChange={(e) => handleChange('reason', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2CA1B1] focus:border-transparent outline-none"
              placeholder="Ej: Control rutinario"
              disabled={loading}
            />
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
              placeholder="Observaciones internas"
              disabled={loading}
            />
          </div>

          {appointment && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Estado
              </label>
              <select
                value={formData.status}
                onChange={(e) => handleChange('status', e.target.value as AppointmentStatus)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2CA1B1] focus:border-transparent outline-none"
                disabled={loading}
              >
                <option value="scheduled">Agendado</option>
                <option value="confirmed">Confirmado</option>
                <option value="in_progress">En curso</option>
                <option value="completed">Completado</option>
                <option value="cancelled">Cancelado</option>
                <option value="no_show">No asistio</option>
              </select>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          <div className="flex gap-3 pt-4">
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
              {loading ? 'Guardando...' : appointment ? 'Actualizar' : 'Crear Turno'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
