import { apiClient } from '@/services/api-client';
import type { StaffMember, InviteStaffRequest, UpdateStaffRequest, StaffQueryParams, PagedResult } from './staff.types';

interface ApiResponse<T> { success: boolean; data: T; }

export const staffService = {
  getAll: async (params?: StaffQueryParams): Promise<PagedResult<StaffMember>> => {
    const res = await apiClient.get<ApiResponse<PagedResult<StaffMember>>>('/api/clinic/staff', { params });
    return res.data.data;
  },
  getById: async (id: string): Promise<StaffMember> => {
    const res = await apiClient.get<ApiResponse<StaffMember>>(`/api/clinic/staff/${id}`);
    return res.data.data;
  },
  invite: async (data: InviteStaffRequest): Promise<StaffMember> => {
    const res = await apiClient.post<ApiResponse<StaffMember>>('/api/clinic/staff/invite', data);
    return res.data.data;
  },
  update: async (id: string, data: UpdateStaffRequest): Promise<StaffMember> => {
    const res = await apiClient.put<ApiResponse<StaffMember>>(`/api/clinic/staff/${id}`, data);
    return res.data.data;
  },
  deactivate: async (id: string): Promise<void> => {
    await apiClient.post(`/api/clinic/staff/${id}/deactivate`);
  },
  reactivate: async (id: string): Promise<void> => {
    await apiClient.post(`/api/clinic/staff/${id}/reactivate`);
  },
};
