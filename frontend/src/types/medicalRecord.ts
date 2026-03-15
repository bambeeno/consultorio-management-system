/**
 * Tipos para Medical Records (Historias Clínicas)
 */

export interface MedicalRecord {
  id: number;
  consultorio_id: number;
  patient_id: number;
  appointment_id?: number;
  doctor_id: number;
  consultation_date: string; // ISO 8601 datetime
  chief_complaint?: string;
  symptoms?: string;
  diagnosis: string;
  treatment?: string;
  notes?: string;
  // Signos vitales
  blood_pressure?: string;
  heart_rate?: number;
  temperature?: number;
  weight?: number;
  height?: number;
  created_at: string;
  updated_at: string;
  // Datos anidados
  patient_name?: string;
  doctor_name?: string;
}

export interface MedicalRecordCreate {
  patient_id: number;
  appointment_id?: number;
  consultation_date: string;
  chief_complaint?: string;
  symptoms?: string;
  diagnosis: string;
  treatment?: string;
  notes?: string;
  blood_pressure?: string;
  heart_rate?: number;
  temperature?: number;
  weight?: number;
  height?: number;
}

export interface MedicalRecordUpdate {
  patient_id?: number;
  appointment_id?: number;
  consultation_date?: string;
  chief_complaint?: string;
  symptoms?: string;
  diagnosis?: string;
  treatment?: string;
  notes?: string;
  blood_pressure?: string;
  heart_rate?: number;
  temperature?: number;
  weight?: number;
  height?: number;
}

export interface MedicalRecordFilters {
  patient_id?: number;
  doctor_id?: number;
  start_date?: string;
  end_date?: string;
  skip?: number;
  limit?: number;
}

export interface MedicalRecordListResponse {
  medical_records: MedicalRecord[];
  total: number;
}
