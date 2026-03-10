import { apiClient } from '@/services/api-client';
import { 
  Clinic, 
  CreateClinicRequest,
  CreateClinicResponse, 
  UpdateClinicRequest, 
  ClinicListParams,
  PaginatedClinicsResponse,
  AddOnDto,
  CreateAddOnRequestDto
} from './clinics.types';

export const clinicsService = {
  /**
   * Get all clinics (paginated)
   * Returns paginated response with items array and pagination metadata
   */
  getAll: async (params: ClinicListParams = {}): Promise<PaginatedClinicsResponse> => {
    const { page = 1, pageSize = 20, ...restParams } = params;
    const response = await apiClient.get<PaginatedClinicsResponse>('/api/admin/clinics', {
      params: { Page: page, PageSize: pageSize, ...restParams },
    });
    return response.data;
  },

  /**
   * Get single clinic by ID
   */
  getById: async (id: string) => {
    const response = await apiClient.get<Clinic>(`/api/admin/clinics/${id}`);
    return response.data;
  },

  /**
   * Create a new clinic
   * Returns clinic, subscription, and paymentTransactionId
   */
  create: async (data: CreateClinicRequest): Promise<CreateClinicResponse> => {
    const response = await apiClient.post<CreateClinicResponse>('/api/admin/clinics', data);
    return response.data;
  },

  /**
   * Update an existing clinic
   */
  update: async (id: string, data: UpdateClinicRequest) => {
    const response = await apiClient.put<Clinic>(`/api/admin/clinics/${id}`, data);
    return response.data;
  },

  /**
   * Delete a clinic
   */
  delete: async (id: string) => {
    await apiClient.delete(`/api/admin/clinics/${id}`);
  },

  /**
   * Suspend a clinic
   */
  suspend: async (id: string) => {
    const response = await apiClient.post<{ message: string }>(`/api/admin/clinics/${id}/suspend`);
    return response.data;
  },

  activate: async (id: string) => {
    const response = await apiClient.post<{ message: string }>(`/api/admin/clinics/${id}/activate`);
    return response.data;
  },

  /**
   * Get all add-ons for a clinic
   */
  getAddOns: async (clinicId: string, status?: number): Promise<AddOnDto[]> => {
    const params = status !== undefined ? { status } : {};
    const response = await apiClient.get<{ success: boolean; data: AddOnDto[] }>(`/api/admin/clinics/${clinicId}/addons`, { params });
    // Handle the standard wrapper if used by the API, or return data directly
    return response.data?.data || (response.data as unknown as AddOnDto[]);
  },

  /**
   * Create an add-on for a clinic
   */
  createAddOn: async (clinicId: string, data: CreateAddOnRequestDto): Promise<AddOnDto> => {
    const response = await apiClient.post<AddOnDto>(`/api/admin/clinics/${clinicId}/addons`, data);
    return response.data;
  },

  /**
   * Cancel an add-on
   */
  cancelAddOn: async (clinicId: string, addOnId: string) => {
    const response = await apiClient.post(`/api/admin/clinics/${clinicId}/addons/${addOnId}/cancel`);
    return response.data;
  },
};
