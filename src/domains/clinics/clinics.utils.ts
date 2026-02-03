import { Clinic, SubscriptionStatus } from './clinics.types';

/**
 * Map subscription status to payment status for badge
 */
export const getPaymentStatus = (status: SubscriptionStatus): 'paid' | 'unpaid' | 'suspended' | 'refunded' => {
  switch (status) {
    case SubscriptionStatus.Active:
      return 'paid';
    case SubscriptionStatus.Inactive:
    case SubscriptionStatus.Expired:
      return 'unpaid';
    case SubscriptionStatus.Cancelled:
      return 'suspended';
    case SubscriptionStatus.Trial:
      return 'paid'; // Trial is considered as active
    default:
      return 'unpaid';
  }
};

/**
 * Calculate the number of active clinics (Active + Trial)
 */
export const calculateActiveClinics = (clinics: Clinic[]): number => {
  return clinics.filter(
    (c) => c.subscriptionStatus === SubscriptionStatus.Active || c.subscriptionStatus === SubscriptionStatus.Trial
  ).length;
};
