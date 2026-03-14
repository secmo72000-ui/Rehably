import { apiClient } from '@/services/api-client';
import { Feature, FeatureCategory } from './features.types';
import type { ApiResponse } from '@/shared/types/common.types';

export const featuresService = {
    /** Get all features (admin endpoint) */
    getAll: async (): Promise<Feature[]> => {
        const response = await apiClient.get<ApiResponse<Feature[]>>('/api/admin/features');
        return response.data.data;
    },

    /** Get features filtered by category */
    getByCategory: async (categoryId: string): Promise<Feature[]> => {
        const response = await apiClient.get<ApiResponse<Feature[]>>(`/api/admin/features?categoryId=${categoryId}`);
        return response.data.data;
    },

    /** Get all feature categories */
    getCategories: async (): Promise<FeatureCategory[]> => {
        const response = await apiClient.get('/api/admin/feature-categories');
        const result = response.data;
        // feature-categories controller may not be migrated yet — handle both shapes
        if (Array.isArray(result)) return result;
        if (result && Array.isArray(result.data)) return result.data;
        return [];
    },

    /** Get category with features included */
    getCategoryDetails: async (categoryId: string): Promise<FeatureCategory> => {
        const response = await apiClient.get(`/api/admin/feature-categories/${categoryId}/details`);
        return response.data?.data ?? response.data;
    },
};
