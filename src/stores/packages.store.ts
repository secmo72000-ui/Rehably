import { create } from 'zustand';
import { packagesService, Package, CreatePackageRequest } from '@/services/packages.service';

// ============ Packages Store Interface ============

interface PackagesState {
  // Data
  packages: Package[];
  
  // Loading states
  isLoading: boolean;
  isArchiving: boolean;
  isCreating: boolean;
  
  // Error
  error: string | null;
  
  // Actions
  fetchPackages: () => Promise<void>;
  archivePackage: (id: number) => Promise<boolean>;
  createPackage: (data: CreatePackageRequest) => Promise<boolean>;
  clearError: () => void;
}

export const usePackagesStore = create<PackagesState>((set, get) => ({
  // Initial state
  packages: [],
  isLoading: false,
  isArchiving: false,
  isCreating: false,
  error: null,

  // ============ Fetch Public Packages ============
  fetchPackages: async () => {
    set({ isLoading: true, error: null });
    try {
      const packages = await packagesService.getPublic();
      set({ 
        packages, 
        isLoading: false 
      });
    } catch (error: any) {
      console.error('Failed to fetch packages', error);
      set({ 
        error: error.message || 'فشل في تحميل الباقات', 
        isLoading: false 
      });
    }
  },

  // ============ Create Package ============
  createPackage: async (data: CreatePackageRequest) => {
    set({ isCreating: true, error: null });
    try {
      const newPackage = await packagesService.create(data);
      // We might need to refresh public packages if the new one is public
      // Or just append it if we trust the response matches the list view
      const currentPackages = get().packages;
      set({ 
        packages: [...currentPackages, newPackage],
        isCreating: false 
      });
      return true;
    } catch (error: any) {
      console.error('Failed to create package', error);
      set({ 
        error: error.message || 'فشل في إنشاء الباقة', 
        isCreating: false 
      });
      return false;
    }
  },

  // ============ Archive Package ============
  archivePackage: async (id: number) => {
    set({ isArchiving: true, error: null });
    try {
      await packagesService.archive(id);
      // Remove from local state
      set((state) => ({
        packages: state.packages.filter((p) => p.id !== id),
        isArchiving: false,
      }));
      return true;
    } catch (error: any) {
      console.error('Failed to archive package', error);
      set({ 
        error: error.message || 'فشل في حذف الباقة', 
        isArchiving: false 
      });
      return false;
    }
  },

  // ============ Clear Error ============
  clearError: () => {
    set({ error: null });
  },
}));
