import { apiClient } from '@/services/api-client';
import type {
  TreatmentPlanItem,
  TreatmentPlanDetail,
  SessionItem,
  CreateTreatmentPlanRequest,
  CreateSessionRequest,
  CompleteSessionRequest,
  TreatmentPlanQueryParams,
} from './treatment-plans.types';
import type { PagedResult } from '@/domains/patients/patients.types';

interface ApiResponse<T> {
  success: boolean;
  data: T;
}

export const treatmentPlansService = {
  getAll: async (params?: TreatmentPlanQueryParams): Promise<PagedResult<TreatmentPlanItem>> => {
    const res = await apiClient.get<ApiResponse<PagedResult<TreatmentPlanItem>>>('/api/clinic/treatment-plans', { params });
    return res.data.data;
  },

  getById: async (id: string): Promise<TreatmentPlanDetail> => {
    const res = await apiClient.get<ApiResponse<TreatmentPlanDetail>>(`/api/clinic/treatment-plans/${id}`);
    return res.data.data;
  },

  getByPatient: async (patientId: string): Promise<TreatmentPlanItem[]> => {
    const res = await apiClient.get<ApiResponse<TreatmentPlanItem[]>>(`/api/clinic/treatment-plans/by-patient/${patientId}`);
    return res.data.data;
  },

  create: async (data: CreateTreatmentPlanRequest): Promise<TreatmentPlanDetail> => {
    const res = await apiClient.post<ApiResponse<TreatmentPlanDetail>>('/api/clinic/treatment-plans', data);
    return res.data.data;
  },

  update: async (id: string, data: Partial<CreateTreatmentPlanRequest>): Promise<TreatmentPlanDetail> => {
    const res = await apiClient.put<ApiResponse<TreatmentPlanDetail>>(`/api/clinic/treatment-plans/${id}`, data);
    return res.data.data;
  },

  activate: async (id: string): Promise<TreatmentPlanDetail> => {
    const res = await apiClient.post<ApiResponse<TreatmentPlanDetail>>(`/api/clinic/treatment-plans/${id}/activate`);
    return res.data.data;
  },

  complete: async (id: string): Promise<TreatmentPlanDetail> => {
    const res = await apiClient.post<ApiResponse<TreatmentPlanDetail>>(`/api/clinic/treatment-plans/${id}/complete`);
    return res.data.data;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/api/clinic/treatment-plans/${id}`);
  },

  // Sessions
  getSessions: async (planId: string): Promise<SessionItem[]> => {
    const res = await apiClient.get<ApiResponse<SessionItem[]>>(`/api/clinic/treatment-plans/${planId}/sessions`);
    return res.data.data;
  },

  addSession: async (planId: string, data: CreateSessionRequest): Promise<SessionItem> => {
    const res = await apiClient.post<ApiResponse<SessionItem>>(`/api/clinic/treatment-plans/${planId}/sessions`, data);
    return res.data.data;
  },

  completeSession: async (sessionId: string, data: CompleteSessionRequest): Promise<SessionItem> => {
    const res = await apiClient.post<ApiResponse<SessionItem>>(`/api/clinic/treatment-plans/sessions/${sessionId}/complete`, data);
    return res.data.data;
  },
};
