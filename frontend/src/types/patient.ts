/**
 * Tipos TypeScript para Pacientes
 */

export interface Patient {
  id: number;
  first_name: string;
  last_name: string;
  ci: string;
  email?: string;
  phone?: string;
  birth_date?: string;
  address?: string;
  created_at: string;
  updated_at?: string;
}

export interface PatientCreate {
  first_name: string;
  last_name: string;
  ci: string;
  email?: string;
  phone?: string;
  birth_date?: string;
  address?: string;
}

export interface PatientUpdate {
  first_name?: string;
  last_name?: string;
  email?: string;
  phone?: string;
  birth_date?: string;
  address?: string;
}
