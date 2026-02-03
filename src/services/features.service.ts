import { apiClient } from '@/services/api-client';

export interface Feature {
    id: number;
    categoryId: number;
    name: string;
    code: string;
    description: string;
    pricingType: number;
    isActive: boolean;
    displayOrder: number;
    createdAt: string;
    updatedAt: string | null;
}

export const featuresService = {
    /**
     * Get all features (public)
     */
    getAll: async (): Promise<Feature[]> => {
        const response = await apiClient.get<Feature[]>('/api/public/feature-catalog/features');
        return response.data;
    },
};
