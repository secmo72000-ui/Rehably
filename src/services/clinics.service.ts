import { apiClient } from '@/services/api-client';
import { 
  Clinic, 
  CreateClinicRequest,
  CreateClinicResponse, 
  UpdateClinicRequest, 
  ClinicListParams,
  PaginatedClinicsResponse 
} from '@/domains/clinics/clinics.types';

export const clinicsService = {
  /**
   * Get all clinics (paginated)
   * Returns paginated response with items array and pagination metadata
   */
  getAll: async (params: ClinicListParams = {}): Promise<PaginatedClinicsResponse> => {
    const { page = 1, pageSize = 20, ...restParams } = params;
    const response = await apiClient.get<PaginatedClinicsResponse>('/api/admin/Clinics', {
      params: { Page: page, PageSize: pageSize, ...restParams },
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
   * Returns clinic, subscription, and paymentTransactionId
   */
  create: async (data: CreateClinicRequest): Promise<CreateClinicResponse> => {
    const response = await apiClient.post<CreateClinicResponse>('/api/admin/Clinics', data);
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
