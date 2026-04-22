/**
 * Clinic Services — shared between appointments modal and settings page.
 * Stored in localStorage key SERVICES_KEY.
 */

export interface ClinicService {
  id: string;
  nameArabic: string;
  nameEnglish: string;
  duration: number;    // minutes
  price: number;       // EGP (0 = not set)
  backendType: number; // 0=Session, 1=Assessment, 2=Package
  color: string;       // hex or tailwind bg class for calendar
  isActive: boolean;
}

export const SERVICES_KEY = 'rehably_clinic_services';

export const BACKEND_TYPE_LABELS: Record<number, string> = {
  0: 'جلسة علاجية',
  1: 'تقييم',
  2: 'باقة',
};

export const DEFAULT_SERVICES: ClinicService[] = [
  { id: 'svc-0', nameArabic: 'علاج طبيعي',  nameEnglish: 'Physical Therapy', duration: 60, price: 0, backendType: 0, color: '#29AAFE', isActive: true },
  { id: 'svc-1', nameArabic: 'تقييم',        nameEnglish: 'Assessment',        duration: 90, price: 0, backendType: 1, color: '#10b981', isActive: true },
  { id: 'svc-2', nameArabic: 'متابعة',       nameEnglish: 'Follow-up',         duration: 30, price: 0, backendType: 0, color: '#f59e0b', isActive: true },
  { id: 'svc-3', nameArabic: 'استشارة',      nameEnglish: 'Consultation',      duration: 30, price: 0, backendType: 0, color: '#8b5cf6', isActive: true },
];

export function loadServices(): ClinicService[] {
  if (typeof window === 'undefined') return DEFAULT_SERVICES.map(s => ({ ...s }));
  try {
    const raw = localStorage.getItem(SERVICES_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as ClinicService[];
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch { /* ignore */ }
  return DEFAULT_SERVICES.map(s => ({ ...s }));
}

export function saveServices(services: ClinicService[]): void {
  try { localStorage.setItem(SERVICES_KEY, JSON.stringify(services)); } catch { /* ignore */ }
}

export function newServiceId(): string {
  return `svc-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
}

export const EMPTY_SERVICE: Omit<ClinicService, 'id'> = {
  nameArabic: '',
  nameEnglish: '',
  duration: 60,
  price: 0,
  backendType: 0,
  color: '#29AAFE',
  isActive: true,
};
