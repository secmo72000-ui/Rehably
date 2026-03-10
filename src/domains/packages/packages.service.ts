import { apiClient } from '@/services/api-client';
import { Package, CreatePackageRequest, UpdatePackageRequest } from './packages.types';

export const packagesService = {
  getAll: async (): Promise<Package[]> => {
    const response = await apiClient.get<Package[]>('/api/admin/packages');
    return response.data;
  },

  create: async (data: CreatePackageRequest): Promise<Package> => {
    const response = await apiClient.post<Package>('/api/admin/packages', data);
    return response.data;
  },

  update: async (id: number | string, data: UpdatePackageRequest): Promise<Package> => {
    const response = await apiClient.put<Package>(`/api/admin/packages/${id}`, data);
    return response.data;
  },

  getPublic: async (): Promise<Package[]> => {
    const response = await apiClient.get<Package[]>('/api/public/packages');
    return response.data;
  },

  getActive: async (): Promise<Package[]> => {
    const packages = await packagesService.getAll();
    return packages.filter(p => p.isActive);
  },

  getById: async (id: number | string): Promise<Package> => {
    const response = await apiClient.get<Package>(`/api/admin/packages/${id}`);
    return response.data;
  },

  /** Get features for a specific package (public endpoint, no auth needed) */
  getPackageFeatures: async (packageId: number | string): Promise<Package['features']> => {
    const response = await apiClient.get(`/api/public/packages/${packageId}/features`);
    const result = response.data;
    // Handle both response shapes
    if (Array.isArray(result)) return result;
    if (result && Array.isArray(result.data)) return result.data;
    return [];
  },

  archive: async (id: number | string): Promise<{ message: string }> => {
    const response = await apiClient.post<{ message: string }>(`/api/admin/packages/${id}/archive`);
    return response.data;
  },

  activate: async (id: number | string): Promise<{ message: string }> => {
    const response = await apiClient.post<{ message: string }>(`/api/admin/packages/${id}/activate`);
    return response.data;
  },
};
