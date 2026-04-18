import {
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

async function req<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    ...options,
  });
  if (!res.ok) throw new Error(`${res.status} ${await res.text()}`);
  if (res.status === 204) return undefined as T;
  return res.json();
}

// ── Insurance ──────────────────────────────────────────────────────────
export const insuranceService = {
  getGlobalProviders: (params?: Record<string, string>) =>
    req<PagedResult<InsuranceProvider>>(`${BASE}/insurance/providers/global?${new URLSearchParams(params)}`),

  getClinicProviders: () =>
    req<ClinicInsuranceProvider[]>(`${BASE}/insurance/providers`),

  activateProvider: (body: object) =>
    req<ClinicInsuranceProvider>(`${BASE}/insurance/providers`, { method: 'POST', body: JSON.stringify(body) }),

  updateProvider: (id: string, body: object) =>
    req<ClinicInsuranceProvider>(`${BASE}/insurance/providers/${id}`, { method: 'PUT', body: JSON.stringify(body) }),

  deactivateProvider: (id: string) =>
    req<void>(`${BASE}/insurance/providers/${id}`, { method: 'DELETE' }),

  getPatientInsurances: (patientId: string) =>
    req<PatientInsurance[]>(`${BASE}/insurance/patients/${patientId}`),

  addPatientInsurance: (body: object) =>
    req<PatientInsurance>(`${BASE}/insurance/patients`, { method: 'POST', body: JSON.stringify(body) }),

  updatePatientInsurance: (id: string, body: object) =>
    req<PatientInsurance>(`${BASE}/insurance/patients/${id}`, { method: 'PUT', body: JSON.stringify(body) }),

  deletePatientInsurance: (id: string) =>
    req<void>(`${BASE}/insurance/patients/${id}`, { method: 'DELETE' }),

  getClaims: (params?: Record<string, string>) =>
    req<PagedResult<InsuranceClaim>>(`${BASE}/insurance/claims?${new URLSearchParams(params)}`),

  submitClaim: (body: object) =>
    req<InsuranceClaim>(`${BASE}/insurance/claims`, { method: 'POST', body: JSON.stringify(body) }),

  updateClaim: (id: string, body: object) =>
    req<InsuranceClaim>(`${BASE}/insurance/claims/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
};

// ── Discounts ──────────────────────────────────────────────────────────
export const discountService = {
  getAll: (params?: Record<string, string>) =>
    req<PagedResult<Discount>>(`${BASE}/discounts?${new URLSearchParams(params)}`),

  getById: (id: string) =>
    req<Discount>(`${BASE}/discounts/${id}`),

  create: (body: object) =>
    req<Discount>(`${BASE}/discounts`, { method: 'POST', body: JSON.stringify(body) }),

  update: (id: string, body: object) =>
    req<Discount>(`${BASE}/discounts/${id}`, { method: 'PUT', body: JSON.stringify(body) }),

  delete: (id: string) =>
    req<void>(`${BASE}/discounts/${id}`, { method: 'DELETE' }),

  validateCode: (body: object) =>
    req<ValidateDiscountResponse>(`${BASE}/discounts/validate`, { method: 'POST', body: JSON.stringify(body) }),
};

// ── Invoices ───────────────────────────────────────────────────────────
export const invoiceService = {
  getAll: (params?: Record<string, string>) =>
    req<PagedResult<InvoiceSummary>>(`${BASE}/invoices?${new URLSearchParams(params)}`),

  getById: (id: string) =>
    req<ClinicInvoice>(`${BASE}/invoices/${id}`),

  create: (body: object) =>
    req<ClinicInvoice>(`${BASE}/invoices`, { method: 'POST', body: JSON.stringify(body) }),

  update: (id: string, body: object) =>
    req<ClinicInvoice>(`${BASE}/invoices/${id}`, { method: 'PUT', body: JSON.stringify(body) }),

  cancel: (id: string) =>
    req<void>(`${BASE}/invoices/${id}/cancel`, { method: 'POST' }),

  createInstallments: (id: string, body: object) =>
    req<ClinicInvoice>(`${BASE}/invoices/${id}/installments`, { method: 'POST', body: JSON.stringify(body) }),

  calculateBreakdown: (body: object) =>
    req<BillingBreakdown>(`${BASE}/invoices/breakdown`, { method: 'POST', body: JSON.stringify(body) }),
};

// ── Payments ───────────────────────────────────────────────────────────
export const paymentService = {
  getAll: (params?: Record<string, string>) =>
    req<PagedResult<ClinicPayment>>(`${BASE}/payments?${new URLSearchParams(params)}`),

  record: (body: object) =>
    req<ClinicPayment>(`${BASE}/payments`, { method: 'POST', body: JSON.stringify(body) }),

  refund: (id: string, body: object) =>
    req<ClinicPayment>(`${BASE}/payments/${id}/refund`, { method: 'POST', body: JSON.stringify(body) }),

  getSummary: (from?: string, to?: string) => {
    const p = new URLSearchParams();
    if (from) p.set('from', from);
    if (to) p.set('to', to);
    return req<PaymentSummary>(`${BASE}/payments/summary?${p}`);
  },

  getPolicy: () =>
    req<BillingPolicy>(`${BASE}/payments/policy`),

  upsertPolicy: (body: object) =>
    req<BillingPolicy>(`${BASE}/payments/policy`, { method: 'PUT', body: JSON.stringify(body) }),
};
