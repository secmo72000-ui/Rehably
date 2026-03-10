import type { PaymentType, BillingCycle } from '@/shared/types';

// ============ Clinic Status Enum ============

/**
 * حالة العيادة — يطابق ClinicStatus في الباك اند
 * @see api-reference.md
 */
export enum ClinicStatus {
  PendingEmailVerification = 0,
  PendingDocumentsAndPackage = 1,
  PendingApproval = 2,
  PendingPayment = 3,
  Active = 4,
  Suspended = 5,
  Cancelled = 6,
  Banned = 7,
  PendingCustomPackageReview = 8,
}

// ============ Subscription Status Enum ============

/**
 * حالة الاشتراك — يطابق SubscriptionStatus في الباك اند
 * @see api-reference.md
 */
export enum SubscriptionStatus {
  Trial = 0,
  Active = 1,
  Suspended = 2,
  Cancelled = 3,
  Expired = 4,
}

// ============ Clinic Entity (GET Response) ============

export interface Clinic {
  id: string;
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
  status: ClinicStatus;
  isDeleted: boolean;
  deletedAt: string | null;
  isBanned: boolean;
  banReason: string | null;
  bannedAt: string | null;
  bannedBy: string | null;
  subscriptionPlanId: string | null;
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
  ownerFirstName: string;
  ownerLastName: string;
  ownerEmail: string;
  paymentMethod: string | null;
  createdAt: string;
  updatedAt: string | null;
}

// ============ Create Clinic Request (POST) ============

export interface ClinicDocument {
  documentType: number;
  base64Content: string;
  fileName: string;
  contentType: string;
}

export interface CreateClinicRequest {
  clinicName: string;
  clinicNameArabic?: string;
  phone: string;
  email: string;
  address?: string;
  city?: string;
  country?: string;
  logoUrl?: string;
  packageId?: string;
  billingCycle?: BillingCycle;
  ownerEmail: string;
  ownerFirstName: string;
  ownerLastName: string;
  paymentType?: PaymentType;
  documents?: ClinicDocument[];
  customTrialDays?: number;
  settings?: Record<string, string>;
}

// ============ Create Clinic Response (POST) ============

export interface CreateClinicResponseData {
  id: string;
  name: string;
  nameArabic?: string | null;
  slug: string;
  email: string;
  phone: string;
  status: number;
  subscriptionId: string;
  packageName: string;
  subscriptionStatus: number;
  subscriptionStartDate: string;
  subscriptionEndDate: string | null;
  paymentType: string;
  paymentTransactionId: string;
  createdAt: string;
}

export interface CreateClinicResponse {
  success: boolean;
  data: CreateClinicResponseData;
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
  search?: string;
  status?: number;
  subscriptionStatus?: number;
  packageId?: string;
  includeDeleted?: boolean;
  sortBy?: string;
  sortDesc?: boolean;
}

// ============ Paginated Clinics Response ============

export interface PaginatedClinicsResponse {
  items: Clinic[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
  hasPrevious: boolean;
  hasNext: boolean;
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

// ============ Add-Ons ============

export interface AddOnDto {
  id: string;
  featureId: string;
  featureName: string;
  limit: number;
  price: number;
  paymentType: number;
  status: number;
  startDate: string;
  endDate: string;
}

export interface CreateAddOnRequestDto {
  featureId: string;
  limit: number;
  price: number;
  startDate: string;
  endDate: string;
  paymentType: number;
}
