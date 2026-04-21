import { apiClient } from '@/services/api-client';
import type { Feature, FeatureCategory, CreateFeatureRequest, UpdateFeatureRequest, CreateFeatureCategoryRequest, UpdateFeatureCategoryRequest } from './features.types';
import type { ApiResponse } from '@/shared/types/common.types';

export const featuresService = {
    // ── Features ──────────────────────────────────────────────

    getAll: async (): Promise<Feature[]> => {
        const response = await apiClient.get<ApiResponse<Feature[]>>('/api/admin/features');
        return response.data.data;
    },

    getByCategory: async (categoryId: string): Promise<Feature[]> => {
        const response = await apiClient.get<ApiResponse<Feature[]>>(`/api/admin/features?categoryId=${categoryId}`);
        return response.data.data;
    },

    getById: async (id: string): Promise<Feature> => {
        const response = await apiClient.get<ApiResponse<Feature>>(`/api/admin/features/${id}`);
        return response.data.data;
    },

    create: async (request: CreateFeatureRequest): Promise<Feature> => {
        const response = await apiClient.post<ApiResponse<Feature>>('/api/admin/features', request);
        return response.data.data;
    },

    update: async (id: string, request: UpdateFeatureRequest): Promise<Feature> => {
        const response = await apiClient.put<ApiResponse<Feature>>(`/api/admin/features/${id}`, request);
        return response.data.data;
    },

    deactivate: async (id: string): Promise<void> => {
        await apiClient.post(`/api/admin/features/${id}/deactivate`);
    },

    // ── Feature Categories ────────────────────────────────────

    getCategories: async (): Promise<FeatureCategory[]> => {
        const response = await apiClient.get<ApiResponse<FeatureCategory[]>>('/api/admin/feature-categories');
        const result = response.data;
        if (Array.isArray(result)) return result;
        if (result && Array.isArray(result.data)) return result.data;
        return [];
    },

    getCategoryDetails: async (categoryId: string): Promise<FeatureCategory> => {
        const response = await apiClient.get(`/api/admin/feature-categories/${categoryId}/details`);
        return response.data?.data ?? response.data;
    },

    createCategory: async (request: CreateFeatureCategoryRequest): Promise<FeatureCategory> => {
        const response = await apiClient.post<ApiResponse<FeatureCategory>>('/api/admin/feature-categories', request);
        return response.data.data;
    },

    updateCategory: async (id: string, request: UpdateFeatureCategoryRequest): Promise<FeatureCategory> => {
        const response = await apiClient.put<ApiResponse<FeatureCategory>>(`/api/admin/feature-categories/${id}`, request);
        return response.data.data;
    },

    deactivateCategory: async (id: string): Promise<void> => {
        await apiClient.post(`/api/admin/feature-categories/${id}/deactivate`);
    },
};
