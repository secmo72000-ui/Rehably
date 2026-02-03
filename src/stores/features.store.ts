import { create } from 'zustand';
import { featuresService, Feature } from '@/services/features.service';

interface FeaturesState {
    // Data
    features: Feature[];
    
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
    isLoading: false,
    error: null,

    // ============ Fetch Features ============
    fetchFeatures: async () => {
        // Optimization: Don't fetch if we already have data
        if (get().features.length > 0) return;

        set({ isLoading: true, error: null });
        try {
            const features = await featuresService.getAll();
            set({ 
                features, 
                isLoading: false 
            });
        } catch (error: any) {
            console.error('Failed to fetch features', error);
            set({ 
                error: error.message || 'فشل في تحميل الخصائص', 
                isLoading: false 
            });
        }
    },
}));
