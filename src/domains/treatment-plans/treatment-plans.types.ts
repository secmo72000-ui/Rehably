export type TreatmentPlanStatus = 'Draft' | 'Active' | 'Completed' | 'Cancelled';
export type SessionStatus = 'Scheduled' | 'Completed' | 'Cancelled' | 'NoShow';

export interface TreatmentPlanItem {
  id: string;
  patientId: string;
  patientName: string;
  therapistId?: string | null;
  therapistName?: string | null;
  title: string;
  diagnosis?: string | null;
  status: TreatmentPlanStatus;
  startDate: string;
  endDate?: string | null;
  totalSessionsPlanned: number;
  completedSessions: number;
  createdAt: string;
}

export interface SessionItem {
  id: string;
  treatmentPlanId: string;
  patientId: string;
  therapistId?: string | null;
  therapistName?: string | null;
  sessionNumber: number;
  sessionDate: string;
  durationMinutes: number;
  status: SessionStatus;
  notes?: string | null;
  patientProgress?: string | null;
  painLevel?: number | null;
  patientSatisfaction?: number | null;
  completedAt?: string | null;
}

export interface TreatmentPlanDetail extends TreatmentPlanItem {
  libraryTreatmentId?: string | null;
  description?: string | null;
  goals?: string | null;
  notes?: string | null;
  sessions: SessionItem[];
  updatedAt?: string | null;
}

export interface CreateTreatmentPlanRequest {
  patientId: string;
  therapistId?: string;
  libraryTreatmentId?: string;
  title: string;
  description?: string;
  diagnosis?: string;
  goals?: string;
  startDate: string;
  endDate?: string;
  totalSessionsPlanned: number;
  notes?: string;
}

export interface CreateSessionRequest {
  therapistId?: string;
  sessionDate: string;
  durationMinutes?: number;
  notes?: string;
}

export interface CompleteSessionRequest {
  notes?: string;
  patientProgress?: string;
  painLevel?: number;
  patientSatisfaction?: number;
  exercisesPerformed?: string;
}

export interface TreatmentPlanQueryParams {
  page?: number;
  pageSize?: number;
  status?: number;
  patientId?: string;
  therapistId?: string;
  search?: string;
}
