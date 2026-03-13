/**
 * Tipos para Patient
 */

export type GenderType = 'masculino' | 'femenino' | 'otro' | 'prefiere_no_decir';

export interface Patient {
  id: number;
  consultorio_id: number;
  first_name: string;
  last_name: string;
  ci: string;
  gender?: GenderType;
  birth_date?: string;
  email?: string;
  phone?: string;
  address?: string;
  created_at: string;
  updated_at: string;
}

export interface PatientCreate {
  first_name: string;
  last_name: string;
  ci: string;
  gender?: GenderType;
  birth_date?: string;
  email?: string;
  phone?: string;
  address?: string;
}

export interface PatientUpdate {
  first_name?: string;
  last_name?: string;
  ci?: string;
  gender?: GenderType;
  birth_date?: string;
  email?: string;
  phone?: string;
  address?: string;
}
