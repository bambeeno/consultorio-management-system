/**
 * Componente de Calendario de Turnos
 * 
 * Muestra los turnos en vista de lista agrupados por fecha
 * Color coding por estado
 */
import { useMemo } from 'react';
import type { Appointment } from '../../types/appointment';

interface AppointmentCalendarProps {
  appointments: Appointment[];
  onEdit: (appointment: Appointment) => void;
  onDelete: (id: number) => void;
}

export default function AppointmentCalendar({
  appointments,
  onEdit,
  onDelete
}: AppointmentCalendarProps) {
  
  /**
   * Agrupar turnos por fecha
   */
  const groupedAppointments = useMemo(() => {
    const groups: { [key: string]: Appointment[] } = {};
    
    appointments.forEach(apt => {
      const date = new Date(apt.start_time).toLocaleDateString('es-PY', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
      
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(apt);
    });
    
    // Ordenar turnos dentro de cada grupo por hora
    Object.keys(groups).forEach(date => {
      groups[date].sort((a, b) => 
        new Date(a.start_time).getTime() - new Date(b.start_time).getTime()
      );
    });
    
    return groups;
  }, [appointments]);

  /**
   * Obtener color segÃºn estado
   */
  const getStatusColor = (status: string) => {
    const colors = {
      scheduled: 'bg-blue-100 text-blue-800 border-blue-200',
      confirmed: 'bg-green-100 text-green-800 border-green-200',
      in_progress: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      completed: 'bg-gray-100 text-gray-800 border-gray-200',
      cancelled: 'bg-red-100 text-red-800 border-red-200',
      no_show: 'bg-orange-100 text-orange-800 border-orange-200'
    };
    return colors[status as keyof typeof colors] || colors.scheduled;
  };

  /**
   * Traducir estado al espaÃ±ol
   */
  const translateStatus = (status: string) => {
    const translations = {
      scheduled: 'Agendado',
      confirmed: 'Confirmado',
      in_progress: 'En curso',
      completed: 'Completado',
      cancelled: 'Cancelado',
      no_show: 'No asistio'
    };
    return translations[status as keyof typeof translations] || status;
  };

  /**
   * Formatear hora
   */
  const formatTime = (datetime: string) => {
    return new Date(datetime).toLocaleTimeString('es-PY', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (appointments.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-12 text-center">
        <div className="text-6xl mb-4">í³…</div>
        <h3 className="text-xl font-semibold text-gray-700 mb-2">
          No hay turnos agendados
        </h3>
        <p className="text-gray-500">
          Crea tu primer turno usando el boton de arriba
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {Object.entries(groupedAppointments).map(([date, dayAppointments]) => (
        <div key={date} className="bg-white rounded-lg shadow overflow-hidden">
          {/* Fecha del dia */}
          <div className="bg-gradient-to-r from-[#051641] to-[#0F6083] text-white px-6 py-3">
            <h2 className="text-lg font-semibold capitalize">
              {date}
            </h2>
          </div>

          {/* Lista de turnos del dia */}
          <div className="divide-y divide-gray-200">
            {dayAppointments.map(appointment => (
              <div
                key={appointment.id}
                className="p-4 hover:bg-gray-50 transition"
              >
                <div className="flex items-start justify-between">
                  {/* Info principal */}
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      {/* Hora */}
                      <span className="text-lg font-semibold text-[#051641]">
                        {formatTime(appointment.start_time)} - {formatTime(appointment.end_time)}
                      </span>

                      {/* Estado */}
                      <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(appointment.status)}`}>
                        {translateStatus(appointment.status)}
                      </span>
                    </div>

                    {/* Paciente */}
                    <p className="text-gray-900 font-medium mb-1">
                      í±¤ {appointment.patient_name || 'Paciente'}
                      {appointment.patient_phone && (
                        <span className="text-gray-500 text-sm ml-2">
                          í³ž {appointment.patient_phone}
                        </span>
                      )}
                    </p>

                    {/* Doctor */}
                    {appointment.doctor_name && (
                      <p className="text-gray-600 text-sm mb-1">
                        í¹º Dr. {appointment.doctor_name}
                      </p>
                    )}

                    {/* Motivo */}
                    {appointment.reason && (
                      <p className="text-gray-600 text-sm">
                        í³‹ {appointment.reason}
                      </p>
                    )}

                    {/* Notas */}
                    {appointment.notes && (
                      <p className="text-gray-500 text-sm mt-2 italic">
                        í²¬ {appointment.notes}
                      </p>
                    )}
                  </div>

                  {/* Acciones */}
                  <div className="flex gap-2 ml-4">
                    <button
                      onClick={() => onEdit(appointment)}
                      className="px-3 py-2 bg-[#2CA1B1] text-white rounded-lg hover:bg-[#0F6083] transition text-sm font-medium"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => onDelete(appointment.id)}
                      className="px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition text-sm font-medium"
                    >
                      Eliminar
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
