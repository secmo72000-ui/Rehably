import { apiClient } from '@/services/api-client';
import type {
  BillingBreakdown,
  BillingPolicy,
  ClinicInsuranceProvider,
  ClinicInvoice,
  ClinicPayment,
  Discount,
  InsuranceClaim,
  InsuranceProvider,
  InvoiceSummary,
  PagedResult,
  PatientInsurance,
  PaymentSummary,
  ValidateDiscountResponse,
} from './billing.types';

const BASE = '/api/clinic';

// ── Insurance ──────────────────────────────────────────────────────────
export const insuranceService = {
  getGlobalProviders: async (params?: Record<string, string>) => {
    const res = await apiClient.get<PagedResult<InsuranceProvider>>(
      `${BASE}/insurance/providers/global`,
      { params }
    );
    return res.data;
  },

  getClinicProviders: async () => {
    const res = await apiClient.get<ClinicInsuranceProvider[]>(`${BASE}/insurance/providers`);
    return res.data;
  },

  activateProvider: async (body: object) => {
    const res = await apiClient.post<ClinicInsuranceProvider>(`${BASE}/insurance/providers`, body);
    return res.data;
  },

  updateProvider: async (id: string, body: object) => {
    const res = await apiClient.put<ClinicInsuranceProvider>(`${BASE}/insurance/providers/${id}`, body);
    return res.data;
  },

  deactivateProvider: async (id: string) => {
    await apiClient.delete(`${BASE}/insurance/providers/${id}`);
  },

  getPatientInsurances: async (patientId: string) => {
    const res = await apiClient.get<PatientInsurance[]>(`${BASE}/insurance/patients/${patientId}`);
    return res.data;
  },

  addPatientInsurance: async (body: object) => {
    const res = await apiClient.post<PatientInsurance>(`${BASE}/insurance/patients`, body);
    return res.data;
  },

  updatePatientInsurance: async (id: string, body: object) => {
    const res = await apiClient.put<PatientInsurance>(`${BASE}/insurance/patients/${id}`, body);
    return res.data;
  },

  deletePatientInsurance: async (id: string) => {
    await apiClient.delete(`${BASE}/insurance/patients/${id}`);
  },

  getClaims: async (params?: Record<string, string>) => {
    const res = await apiClient.get<PagedResult<InsuranceClaim>>(`${BASE}/insurance/claims`, { params });
    return res.data;
  },

  submitClaim: async (body: object) => {
    const res = await apiClient.post<InsuranceClaim>(`${BASE}/insurance/claims`, body);
    return res.data;
  },

  updateClaim: async (id: string, body: object) => {
    const res = await apiClient.put<InsuranceClaim>(`${BASE}/insurance/claims/${id}`, body);
    return res.data;
  },
};

// ── Discounts ──────────────────────────────────────────────────────────
export const discountService = {
  getAll: async (params?: Record<string, string>) => {
    const res = await apiClient.get<PagedResult<Discount>>(`${BASE}/discounts`, { params });
    return res.data;
  },

  getById: async (id: string) => {
    const res = await apiClient.get<Discount>(`${BASE}/discounts/${id}`);
    return res.data;
  },

  create: async (body: object) => {
    const res = await apiClient.post<Discount>(`${BASE}/discounts`, body);
    return res.data;
  },

  update: async (id: string, body: object) => {
    const res = await apiClient.put<Discount>(`${BASE}/discounts/${id}`, body);
    return res.data;
  },

  delete: async (id: string) => {
    await apiClient.delete(`${BASE}/discounts/${id}`);
  },

  validateCode: async (body: object) => {
    const res = await apiClient.post<ValidateDiscountResponse>(`${BASE}/discounts/validate`, body);
    return res.data;
  },
};

// ── Invoices ───────────────────────────────────────────────────────────
export const invoiceService = {
  getAll: async (params?: Record<string, string>) => {
    const res = await apiClient.get<PagedResult<InvoiceSummary>>(`${BASE}/invoices`, { params });
    return res.data;
  },

  getById: async (id: string) => {
    const res = await apiClient.get<ClinicInvoice>(`${BASE}/invoices/${id}`);
    return res.data;
  },

  create: async (body: object) => {
    const res = await apiClient.post<ClinicInvoice>(`${BASE}/invoices`, body);
    return res.data;
  },

  update: async (id: string, body: object) => {
    const res = await apiClient.put<ClinicInvoice>(`${BASE}/invoices/${id}`, body);
    return res.data;
  },

  cancel: async (id: string) => {
    await apiClient.post(`${BASE}/invoices/${id}/cancel`);
  },

  createInstallments: async (id: string, body: object) => {
    const res = await apiClient.post<ClinicInvoice>(`${BASE}/invoices/${id}/installments`, body);
    return res.data;
  },

  calculateBreakdown: async (body: object) => {
    const res = await apiClient.post<BillingBreakdown>(`${BASE}/invoices/breakdown`, body);
    return res.data;
  },
};

// ── Payments ───────────────────────────────────────────────────────────
export const paymentService = {
  getAll: async (params?: Record<string, string>) => {
    const res = await apiClient.get<PagedResult<ClinicPayment>>(`${BASE}/payments`, { params });
    return res.data;
  },

  record: async (body: object) => {
    const res = await apiClient.post<ClinicPayment>(`${BASE}/payments`, body);
    return res.data;
  },

  refund: async (id: string, body: object) => {
    const res = await apiClient.post<ClinicPayment>(`${BASE}/payments/${id}/refund`, body);
    return res.data;
  },

  getSummary: async (from?: string, to?: string) => {
    const params: Record<string, string> = {};
    if (from) params.from = from;
    if (to) params.to = to;
    const res = await apiClient.get<PaymentSummary>(`${BASE}/payments/summary`, { params });
    return res.data;
  },

  getPolicy: async () => {
    const res = await apiClient.get<BillingPolicy>(`${BASE}/payments/policy`);
    return res.data;
  },

  upsertPolicy: async (body: object) => {
    const res = await apiClient.put<BillingPolicy>(`${BASE}/payments/policy`, body);
    return res.data;
  },
};
