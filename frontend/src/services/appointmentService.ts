/**
 * Servicio de Appointments (Turnos)
 */
import api from './api';
import type {
  Appointment,
  AppointmentCreate,
  AppointmentUpdate,
  AppointmentFilters,
  AppointmentListResponse,
  AppointmentStatus
} from '../types/appointment';

const appointmentService = {
  /**
   * Obtener lista de turnos con filtros opcionales
   */
  async getAll(filters?: AppointmentFilters): Promise<AppointmentListResponse> {
    const params = new URLSearchParams();
    
    if (filters?.doctor_id) params.append('doctor_id', filters.doctor_id.toString());
    if (filters?.patient_id) params.append('patient_id', filters.patient_id.toString());
    if (filters?.status) params.append('status', filters.status);
    if (filters?.start_date) params.append('start_date', filters.start_date);
    if (filters?.end_date) params.append('end_date', filters.end_date);
    if (filters?.skip) params.append('skip', filters.skip.toString());
    if (filters?.limit) params.append('limit', filters.limit.toString());
    
    const response = await api.get<AppointmentListResponse>(
      `/appointments?${params.toString()}`
    );
    return response.data;
  },

  /**
   * Obtener un turno por ID
   */
  async getById(id: number): Promise<Appointment> {
    const response = await api.get<Appointment>(`/appointments/${id}`);
    return response.data;
  },

  /**
   * Crear un nuevo turno
   */
  async create(data: AppointmentCreate): Promise<Appointment> {
    const response = await api.post<Appointment>('/appointments', data);
    return response.data;
  },

  /**
   * Actualizar un turno
   */
  async update(id: number, data: AppointmentUpdate): Promise<Appointment> {
    const response = await api.put<Appointment>(`/appointments/${id}`, data);
    return response.data;
  },

  /**
   * Actualizar solo el estado de un turno
   */
  async updateStatus(id: number, status: AppointmentStatus): Promise<Appointment> {
    const response = await api.patch<Appointment>(`/appointments/${id}/status`, { status });
    return response.data;
  },

  /**
   * Eliminar un turno
   */
  async delete(id: number): Promise<void> {
    await api.delete(`/appointments/${id}`);
  }
};

export default appointmentService;
