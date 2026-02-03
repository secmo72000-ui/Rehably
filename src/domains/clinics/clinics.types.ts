// ============ Clinic Entity (GET Response) ============

export interface Clinic {
  id: number;
  name: string;
  nameArabic: string | null;
  slug: string;
  logoUrl: string | null;
  description: string | null;
  phone: string;
  email: string;
  address: string | null;
  city: string | null;
  country: string | null;
  subscriptionPlanId: number | null;
  subscriptionPlanName: string | null;
  subscriptionStatus: SubscriptionStatus;
  subscriptionStartDate: string;
  subscriptionEndDate: string | null;
  trialEndDate: string | null;
  storageUsedBytes: number;
  storageLimitBytes: number;
  patientsCount: number;
  patientsLimit: number | null;
  usersCount: number;
  usersLimit: number | null;
  storageUsedPercentage: number;
  patientsUsedPercentage: number;
  usersUsedPercentage: number;
  tempPassword: string | null;
  createdAt: string;
  updatedAt: string | null;
}

// ============ Subscription Status Enum ============

export enum SubscriptionStatus {
  Active = 0,
  Inactive = 1,
  Trial = 2,
  Expired = 3,
  Cancelled = 4,
}

// ============ Create Clinic Request (POST) ============

export interface CreateClinicRequest {
  clinicName: string;
  clinicNameArabic?: string;
  phone: string;
  email: string;
  address?: string;
  city?: string;
  country?: string;
  logoUrl?: string;
  packageId?: number;
  billingCycle?: number;
  ownerEmail: string;
  ownerFirstName: string;
  ownerLastName: string;
  settings?: Record<string, string>;
}

// ============ Update Clinic Request (PUT) ============

export interface UpdateClinicRequest {
  name: string;
  nameArabic?: string;
  description?: string;
  phone: string;
  email: string;
  address?: string;
  city?: string;
  country?: string;
  settings?: Record<string, string>;
}

// ============ Clinic List Query Params ============

export interface ClinicListParams {
  page?: number;
  pageSize?: number;
}

// ============ Business Rules ============

/**
 * Check if clinic is on trial
 */
export function isOnTrial(clinic: Clinic): boolean {
  return clinic.subscriptionStatus === SubscriptionStatus.Trial;
}

/**
 * Check if clinic subscription is active
 */
export function isSubscriptionActive(clinic: Clinic): boolean {
  return clinic.subscriptionStatus === SubscriptionStatus.Active;
}

/**
 * Get storage usage percentage (0-100)
 */
export function getStorageUsagePercent(clinic: Clinic): number {
  if (clinic.storageLimitBytes === 0) return 0;
  return Math.round((clinic.storageUsedBytes / clinic.storageLimitBytes) * 100);
}

/**
 * Check if clinic is near storage limit (>80%)
 */
export function isNearStorageLimit(clinic: Clinic): boolean {
  return clinic.storageUsedPercentage >= 80;
}
