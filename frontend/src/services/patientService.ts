/**
 * Servicio para operaciones CRUD de Pacientes
 */
import api from './api';
import type { Patient, PatientCreate, PatientUpdate } from '../types/patient';

export const patientService = {
  /**
   * Obtener todos los pacientes
   */
  async getAll(skip: number = 0, limit: number = 100): Promise<Patient[]> {
    const response = await api.get(`/patients/`, {
      params: { skip, limit },
    });
    return response.data;
  },

  /**
   * Obtener un paciente por ID
   */
  async getById(id: number): Promise<Patient> {
    const response = await api.get(`/patients/${id}`);
    return response.data;
  },

  /**
   * Buscar pacientes
   */
  async search(query: string): Promise<Patient[]> {
    const response = await api.get(`/patients/search`, {
      params: { q: query },
    });
    return response.data;
  },

  /**
   * Crear un nuevo paciente
   */
  async create(patient: PatientCreate): Promise<Patient> {
    const response = await api.post(`/patients/`, patient);
    return response.data;
  },

  /**
   * Actualizar un paciente
   */
  async update(id: number, patient: PatientUpdate): Promise<Patient> {
    const response = await api.put(`/patients/${id}`, patient);
    return response.data;
  },

  /**
   * Eliminar un paciente
   */
  async delete(id: number): Promise<void> {
    await api.delete(`/patients/${id}`);
  },
};

export default patientService;
