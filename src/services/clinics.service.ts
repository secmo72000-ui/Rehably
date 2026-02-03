import { apiClient } from '@/services/api-client';
import { 
  Clinic, 
  CreateClinicRequest, 
  UpdateClinicRequest, 
  ClinicListParams 
} from '@/domains/clinics/clinics.types';

export const clinicsService = {
  /**
   * Get all clinics (paginated)
   */
  getAll: async (params: ClinicListParams = {}) => {
    const { page = 1, pageSize = 20 } = params;
    const response = await apiClient.get<Clinic[]>('/api/admin/Clinics', {
      params: { page, pageSize },
    });
    return response.data;
  },

  /**
   * Get single clinic by ID
   */
  getById: async (id: number) => {
    const response = await apiClient.get<Clinic>(`/api/admin/Clinics/${id}`);
    return response.data;
  },

  /**
   * Create a new clinic
   */
  create: async (data: CreateClinicRequest) => {
    const response = await apiClient.post<Clinic>('/api/admin/Clinics', data);
    return response.data;
  },

  /**
   * Update an existing clinic
   */
  update: async (id: number, data: UpdateClinicRequest) => {
    const response = await apiClient.put<Clinic>(`/api/admin/Clinics/${id}`, data);
    return response.data;
  },

  /**
   * Delete a clinic
   */
  delete: async (id: number) => {
    await apiClient.delete(`/api/admin/Clinics/${id}`);
  },

  /**
   * Suspend a clinic
   */
  suspend: async (id: number) => {
    const response = await apiClient.post<{ message: string }>(`/api/admin/Clinics/${id}/suspend`);
    return response.data;
  },

  /**
   * Activate a clinic
   */
  activate: async (id: number) => {
    const response = await apiClient.post<{ message: string }>(`/api/admin/Clinics/${id}/activate`);
    return response.data;
  },
};
