/**
 * Shared API enums — used across domains (clinics, subscriptions, invoices)
 * @see api-reference.md
 */

/** طريقة الدفع — Payment method */
export enum PaymentType {
  Cash = 0,
  Online = 1,
  Free = 2,
}

/** دورة الفوترة — Billing cycle */
export enum BillingCycle {
  Monthly = 0,
  Yearly = 1,
}
