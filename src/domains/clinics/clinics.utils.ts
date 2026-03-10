import { Clinic, ClinicStatus, SubscriptionStatus } from './clinics.types';

/**
 * Map subscription status to payment status for badge
 */
export const getPaymentStatus = (status: SubscriptionStatus): 'paid' | 'unpaid' | 'suspended' | 'refunded' => {
  switch (status) {
    case SubscriptionStatus.Active:
      return 'paid';
    case SubscriptionStatus.Expired:
      return 'unpaid';
    case SubscriptionStatus.Suspended:
    case SubscriptionStatus.Cancelled:
      return 'suspended';
    case SubscriptionStatus.Trial:
      return 'paid'; // Trial is considered as active
    default:
      return 'unpaid';
  }
};

/**
 * Calculate the number of active clinics (Active + Trial subscription status)
 */
export const calculateActiveClinics = (clinics: Clinic[]): number => {
  return clinics.filter(
    (c) => c.subscriptionStatus === SubscriptionStatus.Active || c.subscriptionStatus === SubscriptionStatus.Trial
  ).length;
};

/**
 * Get registration status label key from ClinicStatus
 */
export const getRegistrationStatusKey = (status: ClinicStatus): 'accepted' | 'pending' | 'rejected' | 'suspended' => {
  switch (status) {
    case ClinicStatus.Active:
      return 'accepted';
    case ClinicStatus.PendingEmailVerification:
    case ClinicStatus.PendingDocumentsAndPackage:
    case ClinicStatus.PendingApproval:
    case ClinicStatus.PendingPayment:
    case ClinicStatus.PendingCustomPackageReview:
      return 'pending';
    case ClinicStatus.Suspended:
    case ClinicStatus.Banned:
      return 'suspended';
    case ClinicStatus.Cancelled:
      return 'rejected';
    default:
      return 'pending';
  }
};
