import { apiClient } from '@/services/api-client';
import type {
  AppointmentItem,
  CreateAppointmentRequest,
  AppointmentQueryParams,
} from './appointments.types';
import type { PagedResult } from '@/domains/patients/patients.types';

interface ApiResponse<T> {
  success: boolean;
  data: T;
}

export const appointmentsService = {
  getAll: async (params?: AppointmentQueryParams): Promise<PagedResult<AppointmentItem>> => {
    const res = await apiClient.get<ApiResponse<PagedResult<AppointmentItem>>>('/api/clinic/appointments', { params });
    return res.data.data;
  },

  getCalendar: async (from: string, to: string, therapistId?: string): Promise<AppointmentItem[]> => {
    const res = await apiClient.get<ApiResponse<AppointmentItem[]>>('/api/clinic/appointments/calendar', {
      params: { from, to, therapistId },
    });
    return res.data.data;
  },

  getById: async (id: string): Promise<AppointmentItem> => {
    const res = await apiClient.get<ApiResponse<AppointmentItem>>(`/api/clinic/appointments/${id}`);
    return res.data.data;
  },

  create: async (data: CreateAppointmentRequest): Promise<AppointmentItem> => {
    const res = await apiClient.post<ApiResponse<AppointmentItem>>('/api/clinic/appointments', data);
    return res.data.data;
  },

  confirm: async (id: string): Promise<AppointmentItem> => {
    const res = await apiClient.post<ApiResponse<AppointmentItem>>(`/api/clinic/appointments/${id}/confirm`);
    return res.data.data;
  },

  complete: async (id: string): Promise<AppointmentItem> => {
    const res = await apiClient.post<ApiResponse<AppointmentItem>>(`/api/clinic/appointments/${id}/complete`);
    return res.data.data;
  },

  checkIn: async (id: string): Promise<AppointmentItem> => {
    const res = await apiClient.post<ApiResponse<AppointmentItem>>(`/api/clinic/appointments/${id}/checkin`);
    return res.data.data;
  },

  cancel: async (id: string, reason: string): Promise<AppointmentItem> => {
    const res = await apiClient.post<ApiResponse<AppointmentItem>>(`/api/clinic/appointments/${id}/cancel`, JSON.stringify(reason), {
      headers: { 'Content-Type': 'application/json' },
    });
    return res.data.data;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/api/clinic/appointments/${id}`);
  },
};
