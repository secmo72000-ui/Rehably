import { create } from 'zustand';
import { packagesService } from './packages.service';
import { Package, CreatePackageRequest, UpdatePackageRequest, PackageStatus } from './packages.types';

// ============ Packages Store Interface ============

interface PackagesState {
  // Data
  packages: Package[];
  
  // Loading states
  isLoading: boolean;
  isArchiving: boolean;
  isActivating: boolean;
  isCreating: boolean;
  isUpdating: boolean;
  
  // Error
  error: string | null;
  
  // Actions
  fetchPackages: () => Promise<void>;
  archivePackage: (id: number | string) => Promise<boolean>;
  activatePackage: (id: number | string) => Promise<boolean>;
  createPackage: (data: CreatePackageRequest) => Promise<boolean>;
  updatePackage: (id: number | string, data: UpdatePackageRequest) => Promise<boolean>;
  clearError: () => void;
}

export const usePackagesStore = create<PackagesState>((set, get) => ({
  // Initial state
  packages: [],
  isLoading: false,
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
      const publicPackages = allPackages.filter(p => !p.isCustom && p.isActive);
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

  // ============ Create Package ============
  createPackage: async (data: CreatePackageRequest) => {
    set({ isCreating: true, error: null });
    try {
      const newPackage = await packagesService.create(data);
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

  // ============ Update Package ============
  updatePackage: async (id: number | string, data: UpdatePackageRequest) => {
    set({ isUpdating: true, error: null });
    try {
      const updatedPackage = await packagesService.update(id, data);
      
      set((state) => ({
        packages: state.packages.map((p) => (p.id === id ? updatedPackage : p)),
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
  archivePackage: async (id: number | string) => {
    set({ isArchiving: true, error: null });
    try {
      await packagesService.archive(id);
      // Update package status
      set((state) => ({
        packages: state.packages.map((p) => 
          p.id === id ? { ...p, status: PackageStatus.Archived, isActive: false } : p
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
  activatePackage: async (id: number | string) => {
    set({ isActivating: true, error: null });
    try {
      await packagesService.activate(id);
      // Update package status
      set((state) => ({
        packages: state.packages.map((p) => 
          p.id === id ? { ...p, status: PackageStatus.Active, isActive: true } : p
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
