import { apiClient } from '@/services/api-client';
import type { ApiResponse } from '@/shared/types/common.types';
import { InvoiceListResponse, AdminInvoice, GetInvoicesParams, MarkInvoicePaidRequest } from './invoices.types';

export const invoicesService = {
  getAll: async (params: GetInvoicesParams = {}): Promise<InvoiceListResponse> => {
    const queryParams: Record<string, any> = {};
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        queryParams[key] = value;
      }
    });

    const response = await apiClient.get<ApiResponse<InvoiceListResponse>>('/api/admin/invoices', { params: queryParams });
    return response.data.data;
  },

  getById: async (id: string): Promise<AdminInvoice> => {
    const response = await apiClient.get<ApiResponse<AdminInvoice>>(`/api/admin/invoices/${id}`);
    return response.data.data;
  },

  markPaid: async (id: string, data: MarkInvoicePaidRequest = {}): Promise<AdminInvoice> => {
    const response = await apiClient.post<ApiResponse<AdminInvoice>>(`/api/admin/invoices/${id}/mark-paid`, data);
    return response.data.data;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/api/admin/invoices/${id}`);
  },

  downloadPdf: async (id: string): Promise<Blob> => {
    const response = await apiClient.get(`/api/admin/invoices/${id}/pdf`, {
      responseType: 'blob',
    });
    return response.data;
  },
};
