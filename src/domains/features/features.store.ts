import { create } from 'zustand';
import { featuresService } from './features.service';
import type { Feature, FeatureCategory } from './features.types';

interface FeaturesState {
    // Data
    features: Feature[];
    categories: FeatureCategory[];

    // Loading state
    isLoading: boolean;

    // Error
    error: string | null;

    // Actions
    fetchFeatures: () => Promise<void>;
}

export const useFeaturesStore = create<FeaturesState>((set, get) => ({
    // Initial state
    features: [],
    categories: [],
    isLoading: false,
    error: null,

    // ============ Fetch Features ============
    fetchFeatures: async () => {
        // Optimization: Don't fetch if we already have data
        if (get().features.length > 0 && get().categories.length > 0) return;

        set({ isLoading: true, error: null });
        try {
            const [features, categories] = await Promise.all([
                featuresService.getAll(),
                featuresService.getCategories(),
            ]);
            set({
                features,
                categories,
                isLoading: false,
            });
        } catch (error: any) {
            console.error('Failed to fetch features', error);
            set({
                error: error.message || 'فشل في تحميل الخصائص',
                isLoading: false,
            });
        }
    },
}));
