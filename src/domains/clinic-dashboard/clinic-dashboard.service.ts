import { apiClient } from '@/services/api-client';
import type { ClinicDashboardData } from './clinic-dashboard.types';

interface ApiResponse<T> {
  success: boolean;
  data: T;
}

export const clinicDashboardService = {
  getDashboard: async (): Promise<ClinicDashboardData> => {
    const res = await apiClient.get<ApiResponse<ClinicDashboardData>>('/api/clinic/dashboard');
    return res.data.data;
  },
};
