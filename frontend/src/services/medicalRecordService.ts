import api from './api';
import type {
  MedicalRecord,
  MedicalRecordCreate,
  MedicalRecordUpdate,
  MedicalRecordFilters,
  MedicalRecordListResponse
} from '../types/medicalRecord';

const medicalRecordService = {
  async getAll(filters?: MedicalRecordFilters): Promise<MedicalRecordListResponse> {
    const params = new URLSearchParams();
    
    if (filters?.patient_id) params.append('patient_id', filters.patient_id.toString());
    if (filters?.doctor_id) params.append('doctor_id', filters.doctor_id.toString());
    if (filters?.start_date) params.append('start_date', filters.start_date);
    if (filters?.end_date) params.append('end_date', filters.end_date);
    if (filters?.skip) params.append('skip', filters.skip.toString());
    if (filters?.limit) params.append('limit', filters.limit.toString());
    
    const response = await api.get<MedicalRecordListResponse>(
      `/medical-records?${params.toString()}`
    );
    return response.data;
  },

  async getByPatient(patientId: number): Promise<MedicalRecordListResponse> {
    const response = await api.get<MedicalRecordListResponse>(
      `/medical-records/patient/${patientId}`
    );
    return response.data;
  },

  async getById(id: number): Promise<MedicalRecord> {
    const response = await api.get<MedicalRecord>(`/medical-records/${id}`);
    return response.data;
  },

  async create(data: MedicalRecordCreate): Promise<MedicalRecord> {
    const response = await api.post<MedicalRecord>('/medical-records', data);
    return response.data;
  },

  async update(id: number, data: MedicalRecordUpdate): Promise<MedicalRecord> {
    const response = await api.put<MedicalRecord>(`/medical-records/${id}`, data);
    return response.data;
  },

  async delete(id: number): Promise<void> {
    await api.delete(`/medical-records/${id}`);
  }
};

export default medicalRecordService;
