import { apiClient } from '@/services/api-client';
import type { ApiResponse } from '@/shared/types/common.types';

// ─── Types ───────────────────────────────────────────────────────────────────

export interface SpecialityDto {
  id: string;
  code: string;
  nameEn: string;
  nameAr: string;
  icdChapters: string;
  displayOrder: number;
  isActive: boolean;
  diagnosisCount?: number;
}

export interface CreateSpecialityRequest {
  code: string;
  nameEn: string;
  nameAr: string;
  icdChapters: string;
  displayOrder: number;
  isActive?: boolean;
}

export interface UpdateSpecialityRequest {
  nameEn?: string;
  nameAr?: string;
  icdChapters?: string;
  displayOrder?: number;
  isActive?: boolean;
}

export interface ClinicSpecialityDto {
  specialityId: string;
  code: string;
  nameEn: string;
  nameAr: string;
  icdChapters: string;
  assignedAt?: string;
}

export interface DiagnosisListItem {
  id: string;
  icdCode: string;
  nameEn: string;
  nameAr: string;
  specialityId?: string;
  specialityNameAr?: string;
  bodyRegionName?: string;
  isGlobal: boolean;
  isActive: boolean;
}

export interface DiagnosisDto extends DiagnosisListItem {
  clinicId?: string;
  bodyRegionCategoryId?: string;
  defaultProtocolName?: string;
  suggestedSessions?: number;
  suggestedDurationWeeks?: number;
}

export interface CreateDiagnosisRequest {
  icdCode?: string;
  nameEn: string;
  nameAr: string;
  specialityId?: string;
  bodyRegionCategoryId?: string;
  defaultProtocolName?: string;
  suggestedSessions?: number;
  suggestedDurationWeeks?: number;
}

export interface UpdateDiagnosisRequest {
  nameEn?: string;
  nameAr?: string;
  specialityId?: string;
  bodyRegionCategoryId?: string;
  defaultProtocolName?: string;
  suggestedSessions?: number;
  suggestedDurationWeeks?: number;
  isActive?: boolean;
}

export interface DiagnosisQueryParams {
  specialityId?: string;
  search?: string;
  isGlobal?: boolean;
  page?: number;
  pageSize?: number;
}

export interface PagedResult<T> {
  items: T[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// ─── Specialities ─────────────────────────────────────────────────────────────

export const specialityService = {
  getAll: async (activeOnly = false): Promise<SpecialityDto[]> => {
    const r = await apiClient.get<ApiResponse<SpecialityDto[]>>('/api/admin/specialities', {
      params: { activeOnly },
    });
    return r.data.data;
  },

  getById: async (id: string): Promise<SpecialityDto> => {
    const r = await apiClient.get<ApiResponse<SpecialityDto>>(`/api/admin/specialities/${id}`);
    return r.data.data;
  },

  create: async (req: CreateSpecialityRequest): Promise<SpecialityDto> => {
    const r = await apiClient.post<ApiResponse<SpecialityDto>>('/api/admin/specialities', req);
    return r.data.data;
  },

  update: async (id: string, req: UpdateSpecialityRequest): Promise<SpecialityDto> => {
    const r = await apiClient.put<ApiResponse<SpecialityDto>>(`/api/admin/specialities/${id}`, req);
    return r.data.data;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/api/admin/specialities/${id}`);
  },

  seedDefaults: async (): Promise<void> => {
    await apiClient.post('/api/admin/specialities/seed-defaults');
  },

  // Clinic assignment
  getClinicSpecialities: async (clinicId: string): Promise<ClinicSpecialityDto[]> => {
    const r = await apiClient.get<ApiResponse<ClinicSpecialityDto[]>>(
      `/api/admin/specialities/clinic/${clinicId}`
    );
    return r.data.data;
  },

  assignToClinic: async (clinicId: string, specialityIds: string[]): Promise<void> => {
    await apiClient.post(`/api/admin/specialities/clinic/${clinicId}`, { specialityIds });
  },

  removeFromClinic: async (clinicId: string, specialityId: string): Promise<void> => {
    await apiClient.delete(`/api/admin/specialities/clinic/${clinicId}/${specialityId}`);
  },
};

// ─── Diagnoses ────────────────────────────────────────────────────────────────

export const diagnosisService = {
  getAll: async (params: DiagnosisQueryParams = {}): Promise<PagedResult<DiagnosisListItem>> => {
    const r = await apiClient.get<ApiResponse<PagedResult<DiagnosisListItem>>>('/api/admin/diagnoses', {
      params,
    });
    return r.data.data;
  },

  getById: async (id: string): Promise<DiagnosisDto> => {
    const r = await apiClient.get<ApiResponse<DiagnosisDto>>(`/api/admin/diagnoses/${id}`);
    return r.data.data;
  },

  create: async (req: CreateDiagnosisRequest): Promise<DiagnosisDto> => {
    const r = await apiClient.post<ApiResponse<DiagnosisDto>>('/api/admin/diagnoses', req);
    return r.data.data;
  },

  update: async (id: string, req: UpdateDiagnosisRequest): Promise<DiagnosisDto> => {
    const r = await apiClient.put<ApiResponse<DiagnosisDto>>(`/api/admin/diagnoses/${id}`, req);
    return r.data.data;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/api/admin/diagnoses/${id}`);
  },

  seedIcd10: async (): Promise<number> => {
    const r = await apiClient.post<ApiResponse<number>>('/api/admin/diagnoses/seed-icd10');
    return r.data.data;
  },
};
