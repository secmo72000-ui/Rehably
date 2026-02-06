import { apiClient } from '@/services/api-client';

// ============ Package Types ============

export interface Package {
  id: number;
  name: string;
  code: string;
  description: string;
  monthlyPrice: number;
  yearlyPrice: number;
  calculatedMonthlyPrice: number;
  calculatedYearlyPrice: number;
  status: number;
  isActive: boolean;
  isPublic: boolean;
  isCustom: boolean;
  forClinicId: number | null;
  displayOrder: number;
  trialDays: number;
  createdAt: string;
  updatedAt: string | null;
  features?: Array<{
    featureId: number;
    quantity: number;
    calculatedPrice: number;
    isIncluded: boolean;
    feature?: {
        id: number;
        name: string;
        description: string;
    }
  }>;
}

// ============ Create Package Request ============
export interface CreatePackageRequest {
    name: string;
    description: string;
    monthlyPrice: number;
    yearlyPrice: number;
    trialDays: number;
    features: Array<{
        featureId: number;
        quantity: number;
        calculatedPrice: number;
        isIncluded: boolean;
    }>;
    // Default values
    code?: string;
    calculatedMonthlyPrice?: number;
    calculatedYearlyPrice?: number;
    isPublic?: boolean;
    isCustom?: boolean;
    forClinicId?: number;
    displayOrder?: number;
}

export interface UpdatePackageRequest extends CreatePackageRequest {
    id: number;
}

// ============ Packages Service ============

export const packagesService = {
  /**
   * Get all packages (admin)
   */
  getAll: async (): Promise<Package[]> => {
    const response = await apiClient.get<Package[]>('/api/admin/packages');
    return response.data;
  },

  /**
   * Create a new package
   */
  create: async (data: CreatePackageRequest): Promise<Package> => {
    const response = await apiClient.post<Package>('/api/admin/packages', data);
    return response.data;
  },

  /**
   * Update an existing package
   */
  update: async (id: number, data: UpdatePackageRequest): Promise<Package> => {
    const response = await apiClient.put<Package>(`/api/admin/packages/${id}`, data);
    return response.data;
  },

  /**
   * Get public packages (no auth required)
   */
  getPublic: async (): Promise<Package[]> => {
    const response = await apiClient.get<Package[]>('/api/public/packages');
    return response.data;
  },

  /**
   * Get active packages only (for selects)
   */
  getActive: async (): Promise<Package[]> => {
    const packages = await packagesService.getAll();
    return packages.filter(p => p.isActive);
  },

  /**
   * Archive a package (soft delete)
   */
  archive: async (id: number): Promise<{ message: string }> => {
    const response = await apiClient.post<{ message: string }>(`/api/admin/packages/${id}/archive`);
    return response.data;
  },

  /**
   * Activate a package (reactivate from draft/archived status)
   */
  activate: async (id: number): Promise<{ message: string }> => {
    const response = await apiClient.post<{ message: string }>(`/api/admin/packages/${id}/activate`);
    return response.data;
  },
};
