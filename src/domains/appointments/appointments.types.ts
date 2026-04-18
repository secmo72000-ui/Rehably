export type AppointmentStatus = 'Scheduled' | 'Confirmed' | 'Completed' | 'Cancelled' | 'NoShow';
export type AppointmentType = 'Treatment' | 'Assessment' | 'Followup' | 'Consultation';

export interface AppointmentItem {
  id: string;
  patientId: string;
  patientName: string;
  therapistId?: string | null;
  therapistName?: string | null;
  treatmentPlanId?: string | null;
  treatmentPlanTitle?: string | null;
  startTime: string;
  endTime: string;
  durationMinutes: number;
  status: AppointmentStatus;
  type: AppointmentType;
  title?: string | null;
  notes?: string | null;
  cancellationReason?: string | null;
  createdAt: string;
}

export interface CreateAppointmentRequest {
  patientId: string;
  therapistId?: string;
  treatmentPlanId?: string;
  startTime: string;
  endTime: string;
  type?: number; // AppointmentType enum: 0=Treatment 1=Assessment 2=Followup 3=Consultation
  title?: string;
  notes?: string;
  sendReminder?: boolean;
}

export interface AppointmentQueryParams {
  page?: number;
  pageSize?: number;
  status?: number;
  therapistId?: string;
  patientId?: string;
  from?: string;
  to?: string;
}
