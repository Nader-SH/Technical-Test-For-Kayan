import { apiClient } from './axios';
import type {
  ApiResponse,
  FinanceReview,
  FinanceReviewPayload,
  FinanceSearchFilters,
  FinanceSearchResult,
} from '../types/api';

export const searchFinanceAppointments = async (
  filters: FinanceSearchFilters
) => {
  const { data } = await apiClient.get<ApiResponse<FinanceSearchResult>>(
    '/finance/appointments',
    { params: filters }
  );
  return data.data;
};

export const reviewFinanceAppointment = async (
  appointmentId: string,
  payload: FinanceReviewPayload
) => {
  const { data } = await apiClient.post<ApiResponse<FinanceReview>>(
    `/finance/appointments/${appointmentId}/review`,
    payload
  );
  return data.data;
};

