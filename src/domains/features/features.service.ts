import { apiClient } from '@/services/api-client';
import { Feature, FeatureCategory } from './features.types';

export const featuresService = {
    /** Get all features (admin endpoint) */
    getAll: async (): Promise<Feature[]> => {
        const response = await apiClient.get('/api/admin/features');
        const result = response.data;
        if (Array.isArray(result)) return result;
        if (result && Array.isArray(result.data)) return result.data;
        return [];
    },

    /** Get features filtered by category */
    getByCategory: async (categoryId: string): Promise<Feature[]> => {
        const response = await apiClient.get(`/api/admin/features?categoryId=${categoryId}`);
        const result = response.data;
        if (Array.isArray(result)) return result;
        if (result && Array.isArray(result.data)) return result.data;
        return [];
    },

    /** Get all feature categories */
    getCategories: async (): Promise<FeatureCategory[]> => {
        const response = await apiClient.get('/api/admin/feature-categories');
        const result = response.data;
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
