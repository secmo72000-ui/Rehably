import { create } from 'zustand';
import { clinicsService } from './clinics.service';
import { 
  Clinic, 
  CreateClinicRequest, 
  UpdateClinicRequest,
  PaginatedClinicsResponse,
  SubscriptionStatus,
} from './clinics.types';

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
  totalCount: number;
  totalPages: number;
  hasPrevious: boolean;
  hasNext: boolean;
  
  // Error
  error: string | null;
  
  // Actions
  fetchClinics: (page?: number, pageSize?: number) => Promise<void>;
  fetchClinicById: (id: string) => Promise<Clinic | null>;
  createClinic: (data: CreateClinicRequest) => Promise<Clinic | null>;
  updateClinic: (id: string, data: UpdateClinicRequest) => Promise<Clinic | null>;
  deleteClinic: (id: string) => Promise<boolean>;
  toggleClinicStatus: (id: string, currentStatus: number) => Promise<boolean>;
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
  totalCount: 0,
  totalPages: 1,
  hasPrevious: false,
  hasNext: false,
  error: null,

  // ============ Fetch Clinics ============
  fetchClinics: async (page = 1, pageSize = 20) => {
    set({ isLoading: true, error: null });
    try {
      const response = await clinicsService.getAll({ page, pageSize });
      // Extract items array and pagination metadata from the response
      set({ 
        clinics: response.items, 
        currentPage: response.page, 
        pageSize: response.pageSize,
        totalCount: response.totalCount,
        totalPages: response.totalPages,
        hasPrevious: response.hasPrevious,
        hasNext: response.hasNext,
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
  fetchClinicById: async (id: string) => {
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
      const response = await clinicsService.create(data);
      const resData = response.data;
      // Build a Clinic object from the flat response
      const newClinic: Clinic = {
        id: resData.id,
        name: resData.name,
        nameArabic: resData.nameArabic ?? null,
        slug: resData.slug,
        logoUrl: null,
        description: null,
        phone: resData.phone,
        email: resData.email,
        address: data.address ?? null,
        city: data.city ?? null,
        country: data.country ?? null,
        status: resData.status,
        isDeleted: false,
        deletedAt: null,
        isBanned: false,
        banReason: null,
        bannedAt: null,
        bannedBy: null,
        subscriptionPlanId: resData.subscriptionId,
        subscriptionPlanName: resData.packageName,
        subscriptionStatus: resData.subscriptionStatus,
        subscriptionStartDate: resData.subscriptionStartDate,
        subscriptionEndDate: resData.subscriptionEndDate,
        trialEndDate: null,
        storageUsedBytes: 0,
        storageLimitBytes: 0,
        patientsCount: 0,
        patientsLimit: null,
        usersCount: 0,
        usersLimit: null,
        storageUsedPercentage: 0,
        patientsUsedPercentage: 0,
        usersUsedPercentage: 0,
        ownerFirstName: data.ownerFirstName,
        ownerLastName: data.ownerLastName,
        ownerEmail: data.ownerEmail,
        paymentMethod: resData.paymentType,
        createdAt: resData.createdAt,
        updatedAt: null,
      };
      set((state) => ({
        clinics: [newClinic, ...state.clinics],
        totalCount: state.totalCount + 1,
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
  updateClinic: async (id: string, data: UpdateClinicRequest) => {
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
  deleteClinic: async (id: string) => {
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
  toggleClinicStatus: async (id: string, currentStatus: number) => {
    set({ isTogglingStatus: true, error: null });
    try {
        const isActive = currentStatus === SubscriptionStatus.Active;
        let newStatus: SubscriptionStatus;

        if (isActive) {
            await clinicsService.suspend(id);
            newStatus = SubscriptionStatus.Suspended;
        } else {
            await clinicsService.activate(id);
            newStatus = SubscriptionStatus.Active;
        }

        set((state) => ({
            clinics: state.clinics.map((c) => 
                c.id === id ? { ...c, subscriptionStatus: newStatus } : c
            ),
            selectedClinic: state.selectedClinic?.id === id 
                ? { ...state.selectedClinic, subscriptionStatus: newStatus } 
                : state.selectedClinic,
            isTogglingStatus: false
        }));
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
