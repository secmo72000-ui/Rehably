import { create } from 'zustand';
import { clinicsService } from '@/services/clinics.service';
import { 
  Clinic, 
  CreateClinicRequest, 
  UpdateClinicRequest 
} from '@/domains/clinics/clinics.types';

// ============ Clinics Store Interface ============

interface ClinicsState {
  // Data
  clinics: Clinic[];
  selectedClinic: Clinic | null;
  
  // Loading states
  isLoading: boolean;
  isCreating: boolean;
  isUpdating: boolean;
  isDeleting: boolean;
  isTogglingStatus: boolean;
  
  // Pagination
  currentPage: number;
  pageSize: number;
  
  // Error
  error: string | null;
  
  // Actions
  fetchClinics: (page?: number, pageSize?: number) => Promise<void>;
  fetchClinicById: (id: number) => Promise<Clinic | null>;
  createClinic: (data: CreateClinicRequest) => Promise<Clinic | null>;
  updateClinic: (id: number, data: UpdateClinicRequest) => Promise<Clinic | null>;
  deleteClinic: (id: number) => Promise<boolean>;
  toggleClinicStatus: (id: number, currentStatus: number) => Promise<boolean>;
  setSelectedClinic: (clinic: Clinic | null) => void;
  clearError: () => void;
}

export const useClinicsStore = create<ClinicsState>((set, get) => ({
  // Initial state
  clinics: [],
  selectedClinic: null,
  isLoading: false,
  isCreating: false,
  isUpdating: false,
  isDeleting: false,
  isTogglingStatus: false,
  currentPage: 1,
  pageSize: 20,
  error: null,

  // ============ Fetch Clinics ============
  fetchClinics: async (page = 1, pageSize = 20) => {
    set({ isLoading: true, error: null });
    try {
      const clinics = await clinicsService.getAll({ page, pageSize });
      set({ 
        clinics, 
        currentPage: page, 
        pageSize,
        isLoading: false 
      });
    } catch (error: any) {
      console.error('Failed to fetch clinics', error);
      set({ 
        error: error.message || 'فشل في تحميل العيادات', 
        isLoading: false 
      });
    }
  },

  // ============ Fetch Single Clinic ============
  fetchClinicById: async (id: number) => {
    set({ isLoading: true, error: null });
    try {
      const clinic = await clinicsService.getById(id);
      set({ selectedClinic: clinic, isLoading: false });
      return clinic;
    } catch (error: any) {
      console.error('Failed to fetch clinic', error);
      set({ 
        error: error.message || 'فشل في تحميل بيانات العيادة', 
        isLoading: false 
      });
      return null;
    }
  },

  // ============ Create Clinic ============
  createClinic: async (data: CreateClinicRequest) => {
    set({ isCreating: true, error: null });
    try {
      const newClinic = await clinicsService.create(data);
      // Add to local state
      set((state) => ({
        clinics: [newClinic, ...state.clinics],
        isCreating: false,
      }));
      return newClinic;
    } catch (error: any) {
      console.error('Failed to create clinic', error);
      set({ 
        error: error.message || 'فشل في إنشاء العيادة', 
        isCreating: false 
      });
      return null;
    }
  },

  // ============ Update Clinic ============
  updateClinic: async (id: number, data: UpdateClinicRequest) => {
    set({ isUpdating: true, error: null });
    try {
      const updatedClinic = await clinicsService.update(id, data);
      // Update in local state
      set((state) => ({
        clinics: state.clinics.map((c) => 
          c.id === id ? updatedClinic : c
        ),
        selectedClinic: state.selectedClinic?.id === id 
          ? updatedClinic 
          : state.selectedClinic,
        isUpdating: false,
      }));
      return updatedClinic;
    } catch (error: any) {
      console.error('Failed to update clinic', error);
      set({ 
        error: error.message || 'فشل في تحديث العيادة', 
        isUpdating: false 
      });
      return null;
    }
  },

  // ============ Delete Clinic ============
  deleteClinic: async (id: number) => {
    set({ isDeleting: true, error: null });
    try {
      await clinicsService.delete(id);
      // Remove from local state
      set((state) => ({
        clinics: state.clinics.filter((c) => c.id !== id),
        selectedClinic: state.selectedClinic?.id === id 
          ? null 
          : state.selectedClinic,
        isDeleting: false,
      }));
      return true;
    } catch (error: any) {
      console.error('Failed to delete clinic', error);
      set({ 
        error: error.message || 'فشل في حذف العيادة', 
        isDeleting: false 
      });
      return false;
    }
  },

  // ============ Toggle Clinic Status ============
  toggleClinicStatus: async (id: number, currentStatus: number) => {
    set({ isTogglingStatus: true, error: null });
    try {
        // User said: 1 is Active, 2 is Suspended
        // If 1 (Active) -> Suspend
        // If 2 (Suspended) -> Activate
        let success = false;
        let newStatus = currentStatus;

        if (currentStatus === 1) { // Active -> Suspend
            await clinicsService.suspend(id);
            newStatus = 2; // Suspended
            success = true;
        } else { // Suspended (2 or others) -> Activate
            await clinicsService.activate(id);
            newStatus = 1; // Active
            success = true;
        }

        if (success) {
            set((state) => ({
                clinics: state.clinics.map((c) => 
                    c.id === id ? { ...c, subscriptionStatus: newStatus } : c
                ),
                selectedClinic: state.selectedClinic?.id === id 
                    ? { ...state.selectedClinic, subscriptionStatus: newStatus } 
                    : state.selectedClinic,
                isTogglingStatus: false
            }));
        }
        return true;
    } catch (error: any) {
        console.error('Failed to toggle clinic status', error);
        set({ 
            error: error.message || 'فشل في تغيير حالة العيادة', 
            isTogglingStatus: false 
        });
        return false;
    }
  },

  // ============ Set Selected Clinic ============
  setSelectedClinic: (clinic) => {
    set({ selectedClinic: clinic });
  },

  // ============ Clear Error ============
  clearError: () => {
    set({ error: null });
  },
}));
