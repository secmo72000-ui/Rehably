// ── Enums ──────────────────────────────────────────────────────────────
export type ClaimStatus = 'Draft' | 'Submitted' | 'UnderReview' | 'Approved' | 'Rejected' | 'Paid';
export type DiscountType = 'Percentage' | 'FixedAmount' | 'SessionPackage';
export type DiscountAppliesTo = 'Appointment' | 'TreatmentPlan' | 'SessionPackage' | 'Any';
export type DiscountApplicationMethod = 'Manual' | 'PromoCode' | 'Automatic';
export type CoverageType = 'Percentage' | 'FixedAmount';
export type InstallmentStatus = 'Pending' | 'Paid' | 'Overdue';
export type PaymentTiming = 'AtBooking' | 'AfterEachSession' | 'AfterPlan';
export type BillingServiceType = 'Session' | 'Assessment' | 'Package';
export type PaymentMethod = 'Cash' | 'Card' | 'Online' | 'Insurance' | 'BankTransfer';
export type PaymentStatus = 'Pending' | 'Processing' | 'Completed' | 'Failed' | 'Refunded' | 'PartiallyRefunded';
export type ClinicInvoiceStatus = 'Draft' | 'Issued' | 'PartiallyPaid' | 'Paid' | 'Cancelled' | 'Refunded';

// ── Insurance ──────────────────────────────────────────────────────────
export interface InsuranceProvider {
  id: string;
  name: string;
  nameArabic?: string;
  country?: string;
  logoUrl?: string;
  isGlobal: boolean;
  isActive: boolean;
}

export interface InsuranceServiceRule {
  id: string;
  serviceType: BillingServiceType;
  coverageType: CoverageType;
  coverageValue: number;
  notes?: string;
}

export interface ClinicInsuranceProvider {
  id: string;
  insuranceProviderId: string;
  providerName: string;
  providerNameArabic?: string;
  country?: string;
  logoUrl?: string;
  preAuthRequired: boolean;
  defaultCoveragePercent: number;
  isActive: boolean;
  notes?: string;
  serviceRules: InsuranceServiceRule[];
}

export interface PatientInsurance {
  id: string;
  patientId: string;
  clinicInsuranceProviderId: string;
  providerName: string;
  providerNameArabic?: string;
  policyNumber?: string;
  membershipId?: string;
  holderName?: string;
  coveragePercent: number;
  maxAnnualCoverageAmount?: number;
  expiryDate?: string;
  isActive: boolean;
}

export interface InsuranceClaim {
  id: string;
  patientId: string;
  patientName: string;
  patientInsuranceId: string;
  providerName: string;
  invoiceId?: string;
  invoiceNumber?: string;
  claimNumber?: string;
  status: ClaimStatus;
  submittedAt?: string;
  approvedAmount?: number;
  paidAmount?: number;
  rejectedReason?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

// ── Discounts ──────────────────────────────────────────────────────────
export interface SessionPackageOffer {
  id: string;
  sessionsToPurchase: number;
  sessionsFree: number;
  validForServiceType?: string;
}

export interface Discount {
  id: string;
  name: string;
  nameArabic?: string;
  code?: string;
  type: DiscountType;
  value: number;
  appliesTo: DiscountAppliesTo;
  applicationMethod: DiscountApplicationMethod;
  autoCondition?: string;
  isActive: boolean;
  startsAt?: string;
  expiresAt?: string;
  maxUsageTotal?: number;
  maxUsagePerPatient?: number;
  usageCount: number;
  totalValueGiven: number;
  packageOffer?: SessionPackageOffer;
}

export interface ValidateDiscountResponse {
  isValid: boolean;
  message?: string;
  discountId?: string;
  discountAmount: number;
}

// ── Invoices ───────────────────────────────────────────────────────────
export interface InvoiceLineItem {
  id: string;
  description: string;
  descriptionArabic?: string;
  quantity: number;
  unitPrice: number;
  insuranceCoverageAmount: number;
  discountAmount: number;
  lineTotal: number;
  serviceType: BillingServiceType;
}

export interface InstallmentSchedule {
  id: string;
  dueDate: string;
  amount: number;
  status: InstallmentStatus;
  paymentId?: string;
}

export interface InstallmentPlan {
  id: string;
  totalAmount: number;
  numberOfInstallments: number;
  startDate: string;
  notes?: string;
  schedule: InstallmentSchedule[];
}

export interface ClinicInvoice {
  id: string;
  invoiceNumber: string;
  patientId: string;
  patientName: string;
  appointmentId?: string;
  treatmentPlanId?: string;
  status: ClinicInvoiceStatus;
  subTotal: number;
  insuranceCoverageAmount: number;
  discountAmount: number;
  taxAmount: number;
  totalDue: number;
  totalPaid: number;
  balance: number;
  currency: string;
  dueDate?: string;
  notes?: string;
  issuedAt?: string;
  paidAt?: string;
  createdAt: string;
  lineItems: InvoiceLineItem[];
  installmentPlan?: InstallmentPlan;
}

export interface InvoiceSummary {
  id: string;
  invoiceNumber: string;
  patientId: string;
  patientName: string;
  status: ClinicInvoiceStatus;
  totalDue: number;
  totalPaid: number;
  balance: number;
  currency: string;
  dueDate?: string;
  createdAt: string;
}

export interface BillingBreakdownLine {
  description: string;
  quantity: number;
  unitPrice: number;
  insuranceCoverage: number;
  discount: number;
  lineTotal: number;
}

export interface BillingBreakdown {
  subTotal: number;
  insuranceCoverageAmount: number;
  discountAmount: number;
  taxAmount: number;
  totalDue: number;
  patientDue: number;
  insuranceDue: number;
  lines: BillingBreakdownLine[];
  currency: string;
}

// ── Payments ───────────────────────────────────────────────────────────
export interface ClinicPayment {
  id: string;
  invoiceId: string;
  invoiceNumber: string;
  patientId: string;
  patientName: string;
  amount: number;
  method: PaymentMethod;
  status: PaymentStatus;
  transactionReference?: string;
  paymentGateway?: string;
  paidAt?: string;
  notes?: string;
  recordedByUserId: string;
  createdAt: string;
}

export interface PaymentSummary {
  totalCollected: number;
  totalPending: number;
  totalRefunded: number;
  totalTransactions: number;
  byMethod: Record<string, number>;
}

export interface BillingPolicy {
  id: string;
  defaultPaymentTiming: PaymentTiming;
  allowInstallments: boolean;
  allowDiscountStackWithInsurance: boolean;
  allowMultipleDiscounts: boolean;
  requirePreAuthForInsurance: boolean;
  defaultCurrency: string;
  taxRatePercent?: number;
  invoicePrefix: string;
  autoGenerateInvoice: boolean;
}

// ── PagedResult ────────────────────────────────────────────────────────
export interface PagedResult<T> {
  items: T[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}
