import { create } from 'zustand';
import { packagesService, Package, CreatePackageRequest, UpdatePackageRequest } from '@/services/packages.service';

// ============ Packages Store Interface ============

interface PackagesState {
  // Data
  packages: Package[];
  customPackages: Package[];
  
  // Loading states
  isLoading: boolean;
  isLoadingCustom: boolean;
  isArchiving: boolean;
  isActivating: boolean;
  isCreating: boolean;
  isUpdating: boolean;
  
  // Error
  error: string | null;
  
  // Actions
  fetchPackages: () => Promise<void>;
  fetchCustomPackages: () => Promise<void>;
  archivePackage: (id: number) => Promise<boolean>;
  activatePackage: (id: number) => Promise<boolean>;
  createPackage: (data: CreatePackageRequest) => Promise<boolean>;
  createCustomPackage: (data: CreatePackageRequest) => Promise<boolean>;
  updatePackage: (id: number, data: UpdatePackageRequest) => Promise<boolean>;
  clearError: () => void;
}

export const usePackagesStore = create<PackagesState>((set, get) => ({
  // Initial state
  packages: [],
  customPackages: [],
  isLoading: false,
  isLoadingCustom: false,
  isArchiving: false,
  isActivating: false,
  isCreating: false,
  isUpdating: false,
  error: null,

  // ============ Fetch Public Packages ============
  fetchPackages: async () => {
    set({ isLoading: true, error: null });
    try {
      const allPackages = await packagesService.getAll();
      // Filter for public non-custom packages
      const publicPackages = allPackages.filter(p => p.isPublic && !p.isCustom && p.isActive);
      set({ 
        packages: publicPackages, 
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

  // ============ Fetch Custom Packages ============
  fetchCustomPackages: async () => {
    set({ isLoadingCustom: true, error: null });
    try {
      const allPackages = await packagesService.getAll();
      // Filter for custom packages (isCustom: true with forClinicId)
      const customPackages = allPackages.filter(p => p.isCustom && p.forClinicId);
      set({ 
        customPackages, 
        isLoadingCustom: false 
      });
    } catch (error: any) {
      console.error('Failed to fetch custom packages', error);
      set({ 
        error: error.message || 'فشل في تحميل الباقات الخاصة', 
        isLoadingCustom: false 
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

  // ============ Create Custom Package ============
  createCustomPackage: async (data: CreatePackageRequest) => {
    set({ isCreating: true, error: null });
    try {
      // Ensure the package is marked as custom
      const customData: CreatePackageRequest = {
        ...data,
        isCustom: true,
        isPublic: false,
      };
      const newPackage = await packagesService.create(customData);
      // Add to customPackages list
      const currentCustomPackages = get().customPackages;
      set({ 
        customPackages: [newPackage, ...currentCustomPackages],
        isCreating: false 
      });
      return true;
    } catch (error: any) {
      console.error('Failed to create custom package', error);
      set({ 
        error: error.message || 'فشل في إنشاء الباقة الخاصة', 
        isCreating: false 
      });
      return false;
    }
  },

  // ============ Update Package ============
  updatePackage: async (id: number, data: UpdatePackageRequest) => {
    set({ isUpdating: true, error: null });
    try {
      const updatedPackage = await packagesService.update(id, data);
      
      // Update in both packages and customPackages arrays
      set((state) => ({
        packages: state.packages.map((p) => (p.id === id ? updatedPackage : p)),
        customPackages: state.customPackages.map((p) => (p.id === id ? updatedPackage : p)),
        isUpdating: false,
      }));
      return true;
    } catch (error: any) {
      console.error('Failed to update package', error);
      set({ 
        error: error.message || 'فشل في تعديل الباقة', 
        isUpdating: false 
      });
      return false;
    }
  },

  // ============ Archive Package ============
  archivePackage: async (id: number) => {
    set({ isArchiving: true, error: null });
    try {
      await packagesService.archive(id);
      // Update package status in both arrays (mark as archived, don't remove)
      set((state) => ({
        packages: state.packages.map((p) => 
          p.id === id ? { ...p, status: 3, isActive: false } : p
        ),
        customPackages: state.customPackages.map((p) => 
          p.id === id ? { ...p, status: 3, isActive: false } : p
        ),
        isArchiving: false,
      }));
      return true;
    } catch (error: any) {
      console.error('Failed to archive package', error);
      set({ 
        error: error.message || 'فشل في أرشفة الباقة', 
        isArchiving: false 
      });
      return false;
    }
  },

  // ============ Activate Package ============
  activatePackage: async (id: number) => {
    set({ isActivating: true, error: null });
    try {
      await packagesService.activate(id);
      // Update package status in both arrays (mark as active)
      set((state) => ({
        packages: state.packages.map((p) => 
          p.id === id ? { ...p, status: 1, isActive: true } : p
        ),
        customPackages: state.customPackages.map((p) => 
          p.id === id ? { ...p, status: 1, isActive: true } : p
        ),
        isActivating: false,
      }));
      return true;
    } catch (error: any) {
      console.error('Failed to activate package', error);
      set({ 
        error: error.message || 'فشل في تفعيل الباقة', 
        isActivating: false 
      });
      return false;
    }
  },

  // ============ Clear Error ============
  clearError: () => {
    set({ error: null });
  },
}));
