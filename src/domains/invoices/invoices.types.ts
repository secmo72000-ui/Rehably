// ============ Invoice Line Item ============

export interface InvoiceLineItem {
  id: string;
  invoiceId: string;
  description: string;
  itemType: string;
  referenceId: string | null;
  quantity: number;
  unitPrice: number;
  amount: number;
  sortOrder: number;
}

// ============ Admin Invoice (GET Response) ============

export interface AdminInvoice {
  id: string;
  invoiceNumber: string;
  clinicId: string;
  clinicName: string;
  clinicEmail: string;
  clinicPhone: string;
  clinicVatNumber: string;
  clinicAddress: string;
  taxIdentificationNumber: string;
  clinicCountry: string;
  packageId: string;
  packageName: string;
  amount: number;
  currency: string;
  taxRate: number;
  taxAmount: number;
  addOnsAmount: number;
  totalAmount: number;
  billingPeriodStart: string;
  billingPeriodEnd: string;
  dueDate: string;
  paidAt: string | null;
  paidVia: string | null;
  paymentStatus: string;
  transactionType: string;
  lineItems: InvoiceLineItem[];
}

// ============ Invoice List Response (Paginated) ============

export interface InvoiceListResponse {
  items: AdminInvoice[];
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  pageTotal: number;
  grandTotal: number;
  totalRevenue: number;
}

// ============ Query Params ============

export interface GetInvoicesParams {
  clinicId?: string;
  status?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  pageSize?: number;
}

// ============ Mark Invoice Paid ============

export interface MarkInvoicePaidRequest {
  paymentMethod?: string;
  transactionId?: string;
  notes?: string;
}

// ============ Payment Status Helpers ============

export type InvoicePaymentStatus = 'Paid' | 'Pending' | 'Overdue' | 'Cancelled';

export function getPaymentStatusKey(status: string): 'paid' | 'pending' | 'rejected' {
  const lower = status.toLowerCase();
  if (lower === 'paid') return 'paid';
  if (lower === 'overdue' || lower === 'cancelled' || lower === 'rejected') return 'rejected';
  return 'pending';
}
