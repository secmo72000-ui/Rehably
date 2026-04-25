import { apiClient } from '@/services/api-client';

interface ApiResponse<T> { success: boolean; data: T; }

// ─── Types ────────────────────────────────────────────────────────────────────

export interface StepPostOpDto {
  procedureName?: string; procedureSide?: string; surgeryDate?: string;
  daysPostOp?: number; surgeonFacility?: string; weightBearingStatus?: string;
  romRestriction?: string; postOpPrecautions?: string; woundStatus?: string; notes?: string;
}
export interface StepRedFlagsDto {
  flags?: string; decision?: string; decisionNotes?: string;
  actionsTaken?: string; actionNotes?: string;
}
export interface StepSubjectiveDto {
  chiefComplaint?: string; onsetMechanism?: string;
  painNow?: number; painBest?: number; painWorst?: number;
  nightPain?: boolean; morningStiffness?: boolean; painPattern24h?: string;
  aggravatIngFactors?: string; easingFactors?: string; functionalLimits?: string;
  previousInjuries?: string; medicalHistory?: string; medications?: string;
  screeningFlags?: string; patientGoals?: string; additionalNotes?: string;
}
export interface StepObjectiveDto {
  posture?: string; swelling?: string; redness?: string; deformity?: string;
  gait?: string; transfers?: string; assistiveDevices?: string;
  functionalTests?: string; strengthData?: string; romData?: string; additionalNotes?: string;
}
export interface StepNeuroDto {
  sensation?: string; numbness?: string; tingling?: string; myotomes?: string;
  keyMuscleWeakness?: string; reflexes?: string; neurovascularChecks?: string;
  specialTests?: string; additionalNotes?: string;
}
export interface StepClinicalReasoningDto {
  problemList?: string; workingHypothesis?: string; severityIrritability?: string;
  differentialConsiderations?: string; decisionPoints?: string;
  imagingRequested?: boolean; imagingReason?: string;
  referralRequired?: boolean; referralTo?: string; urgency?: string;
  breakGlassUsed?: boolean; breakGlassReason?: string; additionalNotes?: string;
}

export interface AssessmentDetail {
  id: string; appointmentId: string; patientId: string;
  therapistId?: string; therapistName?: string;
  specialityId: string; specialityNameAr?: string;
  bodyRegionCategoryId?: string;
  diagnosisId?: string; diagnosisNameAr?: string; diagnosisFreeText?: string;
  patientAge?: number; gender?: string; hasPostOp: boolean; additionalNotes?: string;
  status: 'Draft' | 'Submitted' | 'Archived';
  createdAt: string; submittedAt?: string;
  postOp?: StepPostOpDto;
  redFlags?: StepRedFlagsDto;
  subjective?: StepSubjectiveDto;
  objective?: StepObjectiveDto;
  neuro?: StepNeuroDto;
  clinicalReasoning?: StepClinicalReasoningDto;
}

export interface AssessmentSummary {
  id: string; appointmentId: string; patientId: string;
  therapistName?: string; specialityNameAr?: string;
  diagnosisNameAr?: string; diagnosisFreeText?: string;
  status: string; createdAt: string; submittedAt?: string;
}

export interface CreateAssessmentRequest {
  specialityId: string; bodyRegionCategoryId?: string;
  diagnosisId?: string; diagnosisFreeText?: string;
  patientAge?: number; gender?: string; hasPostOp: boolean; additionalNotes?: string;
}

// ─── Service ──────────────────────────────────────────────────────────────────

export const assessmentService = {
  start: async (appointmentId: string, req: CreateAssessmentRequest): Promise<AssessmentDetail> => {
    const r = await apiClient.post<ApiResponse<AssessmentDetail>>(
      `/api/clinic/appointments/${appointmentId}/assessment`, req);
    return r.data.data;
  },

  getByAppointment: async (appointmentId: string): Promise<AssessmentDetail | null> => {
    const r = await apiClient.get<ApiResponse<AssessmentDetail | null>>(
      `/api/clinic/appointments/${appointmentId}/assessment`);
    return r.data.data;
  },

  getById: async (id: string): Promise<AssessmentDetail> => {
    const r = await apiClient.get<ApiResponse<AssessmentDetail>>(`/api/clinic/assessments/${id}`);
    return r.data.data;
  },

  getByPatient: async (patientId: string): Promise<AssessmentSummary[]> => {
    const r = await apiClient.get<ApiResponse<AssessmentSummary[]>>(
      `/api/clinic/patients/${patientId}/assessments`);
    return r.data.data;
  },

  saveStep: async (id: string, step: number, data: unknown): Promise<AssessmentDetail> => {
    const r = await apiClient.put<ApiResponse<AssessmentDetail>>(
      `/api/clinic/assessments/${id}/steps/${step}`, data);
    return r.data.data;
  },

  submit: async (id: string): Promise<AssessmentDetail> => {
    const r = await apiClient.post<ApiResponse<AssessmentDetail>>(
      `/api/clinic/assessments/${id}/submit`);
    return r.data.data;
  },
};
