export interface RecentAppointmentItem {
  id: string;
  patientName: string;
  startTime: string;
  endTime: string;
  therapistName?: string | null;
  status: string;
  type: string;
}

export interface ClinicDashboardData {
  totalPatients: number;
  activePatients: number;
  newPatientsThisMonth: number;
  todayAppointments: number;
  weekAppointments: number;
  pendingAppointments: number;
  activeTreatmentPlans: number;
  completedPlansThisMonth: number;
  sessionsThisMonth: number;
  completedSessionsThisMonth: number;
  patientsLimit?: number | null;
  usersLimit?: number | null;
  subscriptionPlanName?: string | null;
  subscriptionEndDate?: string | null;
  todaySchedule: RecentAppointmentItem[];
}
