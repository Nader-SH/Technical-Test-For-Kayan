export type UserRole = 'patient' | 'doctor' | 'finance';

export interface User {
  id: string;
  full_name: string;
  email: string;
  role: UserRole;
  created_at?: string;
}

export interface Treatment {
  id: string;
  appointment_id: string;
  name: string;
  cost: number;
  created_at?: string;
  updated_at?: string;
}

export type AppointmentStatus =
  | 'scheduled'
  | 'in_progress'
  | 'completed'
  | 'cancelled';

export interface Appointment {
  id: string;
  patient_id: string;
  doctor_id: string;
  status: AppointmentStatus;
  scheduled_time: string;
  started_at?: string | null;
  finished_at?: string | null;
  total_amount: number | string;
  doctor?: User;
  patient?: User;
  treatments?: Treatment[];
  financeReviews?: FinanceReview[];
}

export interface FinanceReview {
  id: string;
  appointment_id: string;
  finance_user_id: string;
  approved: boolean;
  notes?: string | null;
  created_at?: string;
  updated_at?: string;
  financeUser?: User;
}

export interface Pagination {
  total: number;
  page: number;
  totalPages: number;
  limit: number;
}

export interface FinanceSearchResult {
  appointments: Appointment[];
  pagination: Pagination;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface LoginResponse {
  user: User;
  accessToken?: string;
  refreshToken?: string;
}

export interface RefreshResponse {
  accessToken?: string;
  refreshToken?: string;
}

export interface AppointmentPayload {
  doctor_id: string;
  scheduled_time: string;
}

export interface TreatmentPayload {
  name: string;
  cost: number;
}

export interface FinanceSearchFilters {
  doctor?: string;
  patient?: string;
  appointmentId?: string;
  status?: AppointmentStatus;
  from?: string;
  to?: string;
  page?: number;
  limit?: number;
}

export interface FinanceReviewPayload {
  approved: boolean;
  notes?: string;
}

export interface DashboardMetrics {
  activeVisits: number;
  pendingReviews: number;
  revenueToday: number;
}

