import { apiClient } from '@/services/api-client';
import type { ApiResponse } from '@/shared/types/common.types';
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
    const response = await apiClient.get<ApiResponse<PaginatedClinicsResponse>>('/api/admin/clinics', {
      params: { page, pageSize, ...restParams },
    });
    return response.data.data;
  },

  /**
   * Get single clinic by ID
   */
  getById: async (id: string): Promise<Clinic> => {
    const response = await apiClient.get<ApiResponse<Clinic>>(`/api/admin/clinics/${id}`);
    return response.data.data;
  },

  /**
   * Create a new clinic (multipart/form-data for document upload)
   * Returns clinic, subscription, and paymentTransactionId
   */
  create: async (data: CreateClinicRequest): Promise<CreateClinicResponse> => {
    const formData = new FormData();

    // Append all text fields
    formData.append('clinicName', data.clinicName);
    if (data.clinicNameArabic) formData.append('clinicNameArabic', data.clinicNameArabic);
    formData.append('phone', data.phone);
    if (data.email) formData.append('email', data.email);
    if (data.address) formData.append('address', data.address);
    if (data.city) formData.append('city', data.city);
    if (data.country) formData.append('country', data.country);
    if (data.logoUrl) formData.append('logoUrl', data.logoUrl);
    if (data.packageId) formData.append('packageId', data.packageId);
    if (data.billingCycle !== undefined) formData.append('billingCycle', String(data.billingCycle));
    formData.append('ownerEmail', data.ownerEmail);
    formData.append('ownerFirstName', data.ownerFirstName);
    formData.append('ownerLastName', data.ownerLastName);
    if (data.paymentType !== undefined) formData.append('paymentType', String(data.paymentType));
    if (data.customTrialDays !== undefined) formData.append('customTrialDays', String(data.customTrialDays));

    // Append document files
    if (data.ownerIdDocument) formData.append('ownerIdDocument', data.ownerIdDocument);
    if (data.medicalLicenseDocument) formData.append('medicalLicenseDocument', data.medicalLicenseDocument);

    const response = await apiClient.post<CreateClinicResponse>('/api/admin/clinics', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  /**
   * Update an existing clinic
   */
  update: async (id: string, data: UpdateClinicRequest): Promise<Clinic> => {
    const response = await apiClient.put<ApiResponse<Clinic>>(`/api/admin/clinics/${id}`, data);
    return response.data.data;
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
    await apiClient.post(`/api/admin/clinics/${id}/suspend`);
  },

  activate: async (id: string) => {
    await apiClient.post(`/api/admin/clinics/${id}/activate`);
  },

  /**
   * Get all add-ons for a clinic
   */
  getAddOns: async (clinicId: string, status?: number): Promise<AddOnDto[]> => {
    const params = status !== undefined ? { status } : {};
    const response = await apiClient.get<ApiResponse<AddOnDto[]>>(`/api/admin/clinics/${clinicId}/addons`, { params });
    return response.data.data;
  },

  /**
   * Create an add-on for a clinic
   */
  createAddOn: async (clinicId: string, data: CreateAddOnRequestDto): Promise<AddOnDto> => {
    const response = await apiClient.post<ApiResponse<AddOnDto>>(`/api/admin/clinics/${clinicId}/addons`, data);
    return response.data.data;
  },

  /**
   * Cancel an add-on
   */
  cancelAddOn: async (clinicId: string, addOnId: string) => {
    await apiClient.post(`/api/admin/clinics/${clinicId}/addons/${addOnId}/cancel`);
  },
};
