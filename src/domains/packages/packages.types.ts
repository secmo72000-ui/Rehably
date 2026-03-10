/**
 * Package status — matches backend API
 * @see api-reference.md, FRONTEND_INTEGRATION_GUIDE.md
 */
export enum PackageStatus {
  Draft = 1,
  Active = 2,
  Archived = 3,
}

export interface Package {
  id: number | string;
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
  forClinicId: number | string | null;
  displayOrder: number;
  trialDays: number;
  createdAt: string;
  updatedAt: string | null;
  features?: Array<{
    featureId: number | string;
    quantity: number;
    calculatedPrice: number;
    isIncluded: boolean;
    feature?: {
        id: number | string;
        name: string;
        description: string;
    }
  }>;
}

export interface CreatePackageRequest {
    name: string;
    description: string;
    monthlyPrice: number;
    yearlyPrice: number;
    trialDays: number;
    features: Array<{
        featureId: number | string;
        quantity: number;
        calculatedPrice: number;
        isIncluded: boolean;
    }>;
    code?: string;
    calculatedMonthlyPrice?: number;
    calculatedYearlyPrice?: number;
    isPublic?: boolean;
    isCustom?: boolean;
    forClinicId?: number | string;
    displayOrder?: number;
}

export interface UpdatePackageRequest extends CreatePackageRequest {
    id: number | string;
}
