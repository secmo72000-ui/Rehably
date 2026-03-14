import { apiClient } from '@/services/api-client';
import { Package, CreatePackageRequest, UpdatePackageRequest } from './packages.types';
import type { ApiResponse } from '@/shared/types/common.types';

export const packagesService = {
  getAll: async (): Promise<Package[]> => {
    const response = await apiClient.get<ApiResponse<Package[]>>('/api/admin/packages');
    return response.data.data;
  },

  create: async (data: CreatePackageRequest): Promise<Package> => {
    const response = await apiClient.post<ApiResponse<Package>>('/api/admin/packages', data);
    return response.data.data;
  },

  update: async (id: number | string, data: UpdatePackageRequest): Promise<Package> => {
    const response = await apiClient.put<ApiResponse<Package>>(`/api/admin/packages/${id}`, data);
    return response.data.data;
  },

  getPublic: async (): Promise<Package[]> => {
    const response = await apiClient.get<ApiResponse<Package[]>>('/api/public/packages');
    return response.data.data;
  },

  getActive: async (): Promise<Package[]> => {
    const packages = await packagesService.getAll();
    return packages.filter(p => p.isActive);
  },

  getById: async (id: number | string): Promise<Package> => {
    const response = await apiClient.get<ApiResponse<Package>>(`/api/admin/packages/${id}`);
    return response.data.data;
  },

  archive: async (id: number | string): Promise<void> => {
    await apiClient.post(`/api/admin/packages/${id}/archive`);
  },

  activate: async (id: number | string): Promise<void> => {
    await apiClient.post(`/api/admin/packages/${id}/activate`);
  },
};
