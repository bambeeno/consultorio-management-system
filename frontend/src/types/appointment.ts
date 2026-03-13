/**
 * Tipos para Appointments (Turnos)
 */

export enum AppointmentStatus {
  SCHEDULED = 'scheduled',
  CONFIRMED = 'confirmed',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  NO_SHOW = 'no_show'
}

export interface Appointment {
  id: number;
  consultorio_id: number;
  patient_id: number;
  doctor_id: number;
  start_time: string; // ISO 8601 datetime
  end_time: string;
  reason?: string;
  notes?: string;
  status: AppointmentStatus;
  created_at: string;
  updated_at: string;
  // Datos anidados del paciente y doctor
  patient_name?: string;
  patient_phone?: string;
  doctor_name?: string;
}

export interface AppointmentCreate {
  patient_id: number;
  doctor_id: number;
  start_time: string;
  end_time: string;
  reason?: string;
  notes?: string;
  status?: AppointmentStatus;
}

export interface AppointmentUpdate {
  patient_id?: number;
  doctor_id?: number;
  start_time?: string;
  end_time?: string;
  reason?: string;
  notes?: string;
  status?: AppointmentStatus;
}

export interface AppointmentFilters {
  doctor_id?: number;
  patient_id?: number;
  status?: AppointmentStatus;
  start_date?: string; // YYYY-MM-DD
  end_date?: string;
  skip?: number;
  limit?: number;
}

export interface AppointmentListResponse {
  appointments: Appointment[];
  total: number;
}
