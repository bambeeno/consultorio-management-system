/**
 * Formulario de Turno (Modal)
 */
import { useState, useEffect, type SyntheticEvent } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import patientService from '../../services/patientService';
import { AppointmentStatus, type Appointment, type AppointmentCreate } from '../../types/appointment';
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
  
  // Estado local para inputs
  const [startTimeLocal, setStartTimeLocal] = useState('');
  const [endTimeLocal, setEndTimeLocal] = useState('');
  
  const [formData, setFormData] = useState<Omit<AppointmentCreate, 'start_time' | 'end_time'>>({
    patient_id: appointment?.patient_id || 0,
    doctor_id: appointment?.doctor_id || user?.id || 0,
    reason: appointment?.reason || '',
    notes: appointment?.notes || '',
    status: appointment?.status ?? AppointmentStatus.SCHEDULED,
  });
  
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  /**
   * Formatear Date UTC a datetime-local en hora local
   */
  const formatDatetimeLocal = (isoString: string): string => {
    // Crear fecha desde ISO string (viene en UTC del backend)
    const date = new Date(isoString);
    
    // Obtener componentes en hora local
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  /**
   * Convertir datetime-local (YYYY-MM-DDTHH:mm) a ISO string SIN cambiar zona horaria
   * El backend espera UTC, pero queremos enviar la hora exacta que el usuario seleccionó
   */
  const datetimeLocalToISO = (datetimeLocal: string): string => {
    // NO usar new Date() porque convierte a zona horaria local
    // En su lugar, agregar manualmente :00.000Z
    return `${datetimeLocal}:00.000Z`;
  };

  // Cargar datos iniciales si estamos editando
  useEffect(() => {
    if (appointment) {
      setStartTimeLocal(formatDatetimeLocal(appointment.start_time));
      setEndTimeLocal(formatDatetimeLocal(appointment.end_time));
    }
  }, [appointment]);

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

  const handleChange = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: field === 'patient_id' || field === 'doctor_id' ? Number(value) : value
    }));
  };

  /**
   * Manejar cambio de hora de inicio
   * - Calcula automáticamente +1 hora para el fin
   * - Mantiene la misma FECHA
   */
  const handleStartTimeChange = (value: string) => {
    setStartTimeLocal(value);
    
    if (value) {
      // Extraer fecha y hora
      const [date, time] = value.split('T');
      const [hours, minutes] = time.split(':');
      
      // Calcular +1 hora
      let endHours = parseInt(hours) + 1;
      
      // Si pasa de 23h, mantener en 23:59
      if (endHours > 23) {
        endHours = 23;
      }
      
      const endTime = `${String(endHours).padStart(2, '0')}:${minutes}`;
      
      // Mantener la MISMA fecha
      setEndTimeLocal(`${date}T${endTime}`);
    }
  };

  const handleSubmit = async (e: SyntheticEvent<HTMLFormElement>) => {
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

      // Validar que end sea después de start
      if (endTimeLocal <= startTimeLocal) {
        setError('La hora de fin debe ser posterior a la de inicio');
        setLoading(false);
        return;
      }

      // Validar que sea el mismo día
      const startDate = startTimeLocal.split('T')[0];
      const endDate = endTimeLocal.split('T')[0];
      
      if (startDate !== endDate) {
        setError('El turno debe terminar el mismo dia');
        setLoading(false);
        return;
      }

      // Construir el objeto completo para enviar
      const appointmentData: AppointmentCreate = {
        ...formData,
        start_time: datetimeLocalToISO(startTimeLocal),
        end_time: datetimeLocalToISO(endTimeLocal)
      };

      console.log('Enviando:', appointmentData); // Debug

      await onSubmit(appointmentData);
    } catch (err: unknown) {
      if (err instanceof Error) {
        if ((err as { response?: { status?: number } }).response?.status === 409) {
          setError('Ya existe un turno en ese horario');
        } else {
          setError('Error al guardar el turno. Intenta de nuevo.');
        }
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
              onChange={(e) => handleChange('patient_id', String(e.target.value))}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2CA1B1] focus:border-transparent outline-none"
              disabled={loading}
              title="Selecciona el paciente para este turno"
            >
              <option value="">Seleccionar paciente</option>
              {patients.map(patient => (
                <option key={patient.id} value={patient.id}>
                  {patient.first_name} {patient.last_name} - CI: {patient.ci}
                </option>
              ))}
            </select>
          </div>

          {/* Fecha y hora de inicio */}
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
              title="Selecciona la fecha y hora para este turno"
            />
          </div>

          {/* Solo HORA de fin (fecha bloqueada) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Hora de Fin *
            </label>
            <div className="grid grid-cols-2 gap-4">
              {/* Fecha (solo lectura) */}
              <div>
                <label className="block text-xs text-gray-500 mb-1">Fecha (mismo dia)</label>
                <input
                  type="date"
                  value={startTimeLocal.split('T')[0] || ''}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-100 text-gray-600"
                  disabled
                  title="La fecha de fin se mantiene igual a la de inicio"
                />
              </div>
              
              {/* Hora (editable) */}
              <div>
                <label className="block text-xs text-gray-500 mb-1">Hora</label>
                <input
                  type="time"
                  required
                  value={endTimeLocal.split('T')[1] || ''}
                  onChange={(e) => {
                    const date = startTimeLocal.split('T')[0];
                    setEndTimeLocal(`${date}T${e.target.value}`);
                  }}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2CA1B1] focus:border-transparent outline-none"
                  disabled={loading || !startTimeLocal}
                  title="Selecciona la hora de fin"
                />
              </div>
            </div>
            <p className="text-sm text-gray-500 mt-1">
              La hora de fin se calcula automaticamente (+1 hora), pero puedes ajustarla
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
                title="Actualiza el estado del turno"
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
