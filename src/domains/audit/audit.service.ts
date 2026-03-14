import { apiClient } from '@/services/api-client';
import type { ApiResponse } from '@/shared/types/common.types';
import { AuditLogsResponse, GetAuditLogsParams } from './audit.types';

export const auditService = {
  getLogs: async (params: GetAuditLogsParams): Promise<AuditLogsResponse> => {
    // Filter out undefined values from params before sending
    const queryParams: Record<string, any> = {};
    Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
            queryParams[key] = value;
        }
    });

    const response = await apiClient.get<ApiResponse<AuditLogsResponse>>('/api/admin/audit-logs', { params: queryParams });
    return response.data.data;
  },
};
