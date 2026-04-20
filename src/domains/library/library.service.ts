import { apiClient } from '@/services/api-client';
import type { ApiResponse } from '@/shared/types/common.types';
import type {
  LibraryListResponse,
  LibraryQueryParams,
  TreatmentDto,
  CreateTreatmentRequest,
  ExerciseDto,
  CreateExerciseRequest,
  AssessmentDto,
  CreateAssessmentRequest,
  TreatmentStageDto,
  CreateStageRequest,
  ModalityItem,
  DeviceItem,
  CreateDeviceRequest,
} from './library.types';

// ============ Treatments (Admin) ============

export const treatmentsService = {
  getAll: async (params: LibraryQueryParams = {}): Promise<LibraryListResponse<TreatmentDto>> => {
    const response = await apiClient.get<LibraryListResponse<TreatmentDto>>('/api/admin/treatments', { params });
    return response.data;
  },

  getById: async (id: string): Promise<TreatmentDto> => {
    const response = await apiClient.get<TreatmentDto>(`/api/admin/treatments/${id}`);
    return response.data;
  },

  create: async (data: CreateTreatmentRequest): Promise<TreatmentDto> => {
    const response = await apiClient.post<TreatmentDto>('/api/admin/treatments', data);
    return response.data;
  },

  update: async (id: string, data: CreateTreatmentRequest): Promise<TreatmentDto> => {
    const response = await apiClient.put<TreatmentDto>(`/api/admin/treatments/${id}`, data);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/api/admin/treatments/${id}`);
  },
};

// ============ Exercises (Admin) ============

export const exercisesService = {
  getAll: async (params: LibraryQueryParams = {}): Promise<LibraryListResponse<ExerciseDto>> => {
    const response = await apiClient.get<LibraryListResponse<ExerciseDto>>('/api/admin/exercises', { params });
    return response.data;
  },

  getById: async (id: string): Promise<ExerciseDto> => {
    const response = await apiClient.get<ExerciseDto>(`/api/admin/exercises/${id}`);
    return response.data;
  },

  create: async (data: CreateExerciseRequest, video?: File, thumbnail?: File): Promise<ExerciseDto> => {
    const formData = new FormData();
    formData.append('Name', data.name);
    if (data.nameArabic) formData.append('NameArabic', data.nameArabic);
    if (data.description) formData.append('Description', data.description);
    formData.append('BodyRegionCategoryId', data.bodyRegionCategoryId);
    if (data.relatedConditionCode) formData.append('RelatedConditionCode', data.relatedConditionCode);
    if (data.tags) formData.append('Tags', data.tags);
    if (data.repeats !== undefined) formData.append('Repeats', String(data.repeats));
    if (data.steps !== undefined) formData.append('Steps', String(data.steps));
    if (data.holdSeconds !== undefined) formData.append('HoldSeconds', String(data.holdSeconds));
    if (data.linkedExerciseIds) formData.append('LinkedExerciseIds', data.linkedExerciseIds);
    if (data.accessTier !== undefined) formData.append('AccessTier', String(data.accessTier));
    if (video) formData.append('video', video);
    if (thumbnail) formData.append('thumbnail', thumbnail);

    const response = await apiClient.post<ExerciseDto>('/api/admin/exercises', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  update: async (id: string, data: CreateExerciseRequest, video?: File): Promise<ExerciseDto> => {
    const formData = new FormData();
    formData.append('Name', data.name);
    if (data.nameArabic) formData.append('NameArabic', data.nameArabic);
    if (data.description) formData.append('Description', data.description);
    formData.append('BodyRegionCategoryId', data.bodyRegionCategoryId);
    if (data.relatedConditionCode) formData.append('RelatedConditionCode', data.relatedConditionCode);
    if (data.tags) formData.append('Tags', data.tags);
    if (data.repeats !== undefined) formData.append('Repeats', String(data.repeats));
    if (data.steps !== undefined) formData.append('Steps', String(data.steps));
    if (data.holdSeconds !== undefined) formData.append('HoldSeconds', String(data.holdSeconds));
    if (data.linkedExerciseIds) formData.append('LinkedExerciseIds', data.linkedExerciseIds);
    if (data.accessTier !== undefined) formData.append('AccessTier', String(data.accessTier));
    if (video) formData.append('video', video);

    const response = await apiClient.put<ExerciseDto>(`/api/admin/exercises/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/api/admin/exercises/${id}`);
  },
};

// ============ Assessments (Admin) ============

export const assessmentsService = {
  getAll: async (params: LibraryQueryParams = {}): Promise<LibraryListResponse<AssessmentDto>> => {
    const response = await apiClient.get<LibraryListResponse<AssessmentDto>>('/api/admin/assessments', { params });
    return response.data;
  },

  getById: async (id: string): Promise<AssessmentDto> => {
    const response = await apiClient.get<AssessmentDto>(`/api/admin/assessments/${id}`);
    return response.data;
  },

  create: async (data: CreateAssessmentRequest): Promise<AssessmentDto> => {
    const response = await apiClient.post<AssessmentDto>('/api/admin/assessments', data);
    return response.data;
  },

  update: async (id: string, data: CreateAssessmentRequest): Promise<AssessmentDto> => {
    const response = await apiClient.put<AssessmentDto>(`/api/admin/assessments/${id}`, data);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/api/admin/assessments/${id}`);
  },
};

// ============ Clinic Library (clinic-scoped, uses TenantId from JWT) ============

interface ClinicApiResponse<T> {
  success: boolean;
  data: T;
}

export const clinicLibraryService = {
  getExercises: async (params: LibraryQueryParams = {}): Promise<LibraryListResponse<ExerciseDto>> => {
    const response = await apiClient.get<ClinicApiResponse<LibraryListResponse<ExerciseDto>>>('/api/clinic/library/exercises', { params });
    return response.data.data;
  },

  getModalities: async (params: LibraryQueryParams = {}): Promise<LibraryListResponse<ModalityItem>> => {
    const response = await apiClient.get<ClinicApiResponse<LibraryListResponse<ModalityItem>>>('/api/clinic/library/modalities', { params });
    return response.data.data;
  },

  getDevices: async (params: LibraryQueryParams = {}): Promise<LibraryListResponse<DeviceItem>> => {
    const response = await apiClient.get<ClinicApiResponse<LibraryListResponse<DeviceItem>>>('/api/clinic/library/devices', { params });
    return response.data.data;
  },

  getAssessments: async (params: LibraryQueryParams = {}): Promise<LibraryListResponse<AssessmentDto>> => {
    const response = await apiClient.get<ClinicApiResponse<LibraryListResponse<AssessmentDto>>>('/api/clinic/library/assessments', { params });
    return response.data.data;
  },

  getTreatments: async (params: LibraryQueryParams = {}): Promise<LibraryListResponse<TreatmentDto>> => {
    const response = await apiClient.get<ClinicApiResponse<LibraryListResponse<TreatmentDto>>>('/api/clinic/library/treatments', { params });
    return response.data.data;
  },
};

// ============ Stages (Admin — ApiResponse wrapped) ============

export const stagesService = {
  getAll: async (params: LibraryQueryParams = {}): Promise<LibraryListResponse<TreatmentStageDto>> => {
    const response = await apiClient.get<ApiResponse<LibraryListResponse<TreatmentStageDto>>>('/api/admin/stages', { params });
    return response.data.data;
  },

  getById: async (id: string): Promise<TreatmentStageDto> => {
    const response = await apiClient.get<ApiResponse<TreatmentStageDto>>(`/api/admin/stages/${id}`);
    return response.data.data;
  },

  create: async (data: CreateStageRequest): Promise<TreatmentStageDto> => {
    const response = await apiClient.post<ApiResponse<TreatmentStageDto>>('/api/admin/stages', data);
    return response.data.data;
  },

  update: async (id: string, data: CreateStageRequest): Promise<TreatmentStageDto> => {
    const response = await apiClient.put<ApiResponse<TreatmentStageDto>>(`/api/admin/stages/${id}`, data);
    return response.data.data;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/api/admin/stages/${id}`);
  },
};

// ============ Devices (Admin) ============

export const devicesService = {
  getAll: async (params: LibraryQueryParams = {}): Promise<LibraryListResponse<DeviceItem>> => {
    const response = await apiClient.get<LibraryListResponse<DeviceItem>>('/api/admin/devices', { params });
    return response.data;
  },

  getById: async (id: string): Promise<DeviceItem> => {
    const response = await apiClient.get<DeviceItem>(`/api/admin/devices/${id}`);
    return response.data;
  },

  create: async (data: CreateDeviceRequest, image?: File): Promise<DeviceItem> => {
    const formData = new FormData();
    formData.append('Name', data.name);
    if (data.nameArabic) formData.append('NameArabic', data.nameArabic);
    if (data.description) formData.append('Description', data.description);
    if (data.relatedConditionCodes) formData.append('RelatedConditionCodes', data.relatedConditionCodes);
    if (data.manufacturer) formData.append('Manufacturer', data.manufacturer);
    if (data.model) formData.append('Model', data.model);
    if (data.accessTier !== undefined) formData.append('AccessTier', String(data.accessTier));
    if (image) formData.append('image', image);

    const response = await apiClient.post<DeviceItem>('/api/admin/devices', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  update: async (id: string, data: CreateDeviceRequest, image?: File): Promise<DeviceItem> => {
    const formData = new FormData();
    formData.append('Name', data.name);
    if (data.nameArabic) formData.append('NameArabic', data.nameArabic);
    if (data.description) formData.append('Description', data.description);
    if (data.relatedConditionCodes) formData.append('RelatedConditionCodes', data.relatedConditionCodes);
    if (data.manufacturer) formData.append('Manufacturer', data.manufacturer);
    if (data.model) formData.append('Model', data.model);
    if (data.accessTier !== undefined) formData.append('AccessTier', String(data.accessTier));
    if (image) formData.append('image', image);

    const response = await apiClient.put<DeviceItem>(`/api/admin/devices/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/api/admin/devices/${id}`);
  },
};
