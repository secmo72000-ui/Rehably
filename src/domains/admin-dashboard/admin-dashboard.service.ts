import { apiClient } from '@/services/api-client';

// ─── Types ────────────────────────────────────────────────────────────────────

export type SubscriptionStatus = 'Trial' | 'Active' | 'Suspended' | 'Cancelled' | 'Expired';

export interface RecentSubscriptionItem {
  id: string;
  clinicId: string;
  clinicName: string;
  packageName: string;
  status: SubscriptionStatus;
  startDate: string;
  endDate: string;
  createdAt: string;
}

export interface AdminDashboardData {
  totalClinics: number;
  activeClinics: number;
  suspendedClinics: number;
  totalUsers: number;
  activeSubscriptions: number;
  totalRevenue: number;
  recentSubscriptions: RecentSubscriptionItem[];
}

// ─── Service ─────────────────────────────────────────────────────────────────

export const adminDashboardService = {
  getDashboard: async (): Promise<AdminDashboardData> => {
    const r = await apiClient.get<{ data: AdminDashboardData }>('/api/admin/dashboard');
    return r.data.data;
  },
};
