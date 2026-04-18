// ============ Paginated List Response ============

export interface LibraryListResponse<T> {
  items: T[];
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  hasPrevious: boolean;
  hasNext: boolean;
}

export interface LibraryQueryParams {
  bodyRegionId?: string;
  search?: string;
  page?: number;
  pageSize?: number;
}

// ============ Treatment ============

export interface TreatmentDto {
  id: string;
  clinicId: string | null;
  code: string;
  name: string;
  nameArabic: string | null;
  bodyRegionCategoryId: string;
  bodyRegionCategoryName: string | null;
  affectedArea: string;
  minDurationWeeks: number;
  maxDurationWeeks: number;
  expectedSessions: number;
  description: string | null;
  redFlags: string | null;
  contraindications: string | null;
  clinicalNotes: string | null;
  sourceReference: string | null;
  sourceDetails: string | null;
  accessTier: number;
  isGlobal: boolean;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string | null;
}

export interface CreateTreatmentRequest {
  code: string;
  name: string;
  nameArabic?: string;
  bodyRegionCategoryId: string;
  affectedArea: string;
  minDurationWeeks: number;
  maxDurationWeeks: number;
  expectedSessions: number;
  description?: string;
  redFlags?: string;
  contraindications?: string;
  clinicalNotes?: string;
  sourceReference?: string;
  sourceDetails?: string;
  accessTier?: number;
}

// ============ Exercise ============

export interface ExerciseDto {
  id: string;
  clinicId: string | null;
  name: string;
  nameArabic: string | null;
  description: string | null;
  bodyRegionCategoryId: string;
  bodyRegionCategoryName: string | null;
  relatedConditionCode: string | null;
  tags: string | null;
  repeats: number | null;
  steps: number | null;
  holdSeconds: number | null;
  videoUrl: string | null;
  thumbnailUrl: string | null;
  linkedExerciseIds: string | null;
  accessTier: number;
  isGlobal: boolean;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string | null;
}

export interface CreateExerciseRequest {
  name: string;
  nameArabic?: string;
  description?: string;
  bodyRegionCategoryId: string;
  relatedConditionCode?: string;
  tags?: string;
  repeats?: number;
  steps?: number;
  holdSeconds?: number;
  linkedExerciseIds?: string;
  accessTier?: number;
}

// ============ Assessment ============

export interface AssessmentDto {
  id: string;
  clinicId: string | null;
  code: string;
  name: string;
  nameArabic: string | null;
  timePoint: number;
  description: string | null;
  instructions: string | null;
  scoringGuide: string | null;
  relatedConditionCodes: string | null;
  accessTier: number;
  isGlobal: boolean;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string | null;
}

export interface CreateAssessmentRequest {
  code: string;
  name: string;
  nameArabic?: string;
  timePoint?: number;
  description?: string;
  instructions?: string;
  scoringGuide?: string;
  relatedConditionCodes?: string;
  accessTier?: number;
}

// ============ Treatment Stage ============

export interface TreatmentStageDto {
  id: string;
  tenantId: string;
  bodyRegionId: string | null;
  bodyRegionName: string | null;
  code: string;
  name: string;
  nameArabic: string | null;
  description: string | null;
  minWeeks: number | null;
  maxWeeks: number | null;
  minSessions: number | null;
  maxSessions: number | null;
  createdAt: string;
  updatedAt: string | null;
}

// ============ Modality (for clinic library) ============

export interface ModalityItem {
  id: string;
  clinicId: string | null;
  code: string;
  name: string;
  nameArabic: string | null;
  modalityType: number;
  therapeuticCategory: string;
  mainGoal: string;
  parametersNotes: string | null;
  clinicalNotes: string | null;
  minDurationWeeks: number | null;
  maxDurationWeeks: number | null;
  minSessions: number | null;
  maxSessions: number | null;
  relatedConditionCodes: string | null;
  accessTier: number;
  isGlobal: boolean;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string | null;
}

// ============ Device (for clinic library) ============

export interface DeviceItem {
  id: string;
  clinicId: string | null;
  name: string;
  nameArabic: string | null;
  description: string | null;
  imageUrl: string | null;
  relatedConditionCodes: string | null;
  manufacturer: string | null;
  model: string | null;
  accessTier: number;
  isGlobal: boolean;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string | null;
}

export interface CreateStageRequest {
  bodyRegionId?: string;
  code: string;
  name: string;
  nameArabic?: string;
  description?: string;
  minWeeks?: number;
  maxWeeks?: number;
  minSessions?: number;
  maxSessions?: number;
}
