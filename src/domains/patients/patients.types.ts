export type PatientStatus = 'Active' | 'Inactive' | 'Discharged';
export type Gender = 'Male' | 'Female';

export interface PatientListItem {
  id: string;
  firstName: string;
  lastName: string;
  firstNameArabic?: string | null;
  lastNameArabic?: string | null;
  phone?: string | null;
  email?: string | null;
  dateOfBirth?: string | null;
  gender: string;
  status: PatientStatus;
  diagnosis?: string | null;
  appointmentsCount: number;
  activeTreatmentPlansCount: number;
  createdAt: string;
}

export interface PatientDetail extends PatientListItem {
  clinicId: string;
  nationalId?: string | null;
  address?: string | null;
  city?: string | null;
  emergencyContactName?: string | null;
  emergencyContactPhone?: string | null;
  emergencyContactRelation?: string | null;
  medicalHistory?: string | null;
  allergies?: string | null;
  currentMedications?: string | null;
  notes?: string | null;
  profileImageUrl?: string | null;
  dischargedAt?: string | null;
  updatedAt?: string | null;
}

export interface CreatePatientRequest {
  firstName: string;
  lastName: string;
  firstNameArabic?: string;
  lastNameArabic?: string;
  nationalId?: string;
  dateOfBirth?: string;
  gender: number; // 0=Male 1=Female
  phone?: string;
  email?: string;
  address?: string;
  city?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  emergencyContactRelation?: string;
  diagnosis?: string;
  medicalHistory?: string;
  allergies?: string;
  currentMedications?: string;
  notes?: string;
}

export interface PatientQueryParams {
  page?: number;
  pageSize?: number;
  search?: string;
  status?: number; // PatientStatus enum value
  therapistId?: string;
}

export interface PagedResult<T> {
  items: T[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}
