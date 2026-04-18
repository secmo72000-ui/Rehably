import { apiClient } from '@/services/api-client';
import type {
  PatientListItem,
  PatientDetail,
  CreatePatientRequest,
  PatientQueryParams,
  PagedResult,
} from './patients.types';

interface ApiResponse<T> {
  success: boolean;
  data: T;
}

export const patientsService = {
  getAll: async (params?: PatientQueryParams): Promise<PagedResult<PatientListItem>> => {
    const res = await apiClient.get<ApiResponse<PagedResult<PatientListItem>>>('/api/clinic/patients', { params });
    return res.data.data;
  },

  getById: async (id: string): Promise<PatientDetail> => {
    const res = await apiClient.get<ApiResponse<PatientDetail>>(`/api/clinic/patients/${id}`);
    return res.data.data;
  },

  create: async (data: CreatePatientRequest): Promise<PatientDetail> => {
    const res = await apiClient.post<ApiResponse<PatientDetail>>('/api/clinic/patients', data);
    return res.data.data;
  },

  update: async (id: string, data: Partial<CreatePatientRequest>): Promise<PatientDetail> => {
    const res = await apiClient.put<ApiResponse<PatientDetail>>(`/api/clinic/patients/${id}`, data);
    return res.data.data;
  },

  discharge: async (id: string): Promise<PatientDetail> => {
    const res = await apiClient.post<ApiResponse<PatientDetail>>(`/api/clinic/patients/${id}/discharge`);
    return res.data.data;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/api/clinic/patients/${id}`);
  },
};
