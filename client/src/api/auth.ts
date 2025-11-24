import { apiClient } from './axios';
import type {
  ApiResponse,
  LoginPayload,
  LoginResponse,
  RefreshResponse,
  User,
} from '../types/api';

export interface SignupPayload {
  full_name: string;
  email: string;
  password: string;
  role: 'patient' | 'doctor' | 'finance';
}

export const signupRequest = async (payload: SignupPayload) => {
  const { data } = await apiClient.post<ApiResponse<User>>(
    '/auth/signup',
    payload
  );

  if (!data.data) {
    throw new Error('Malformed signup response');
  }

  return data.data;
};

export const loginRequest = async (payload: LoginPayload) => {
  const { data } = await apiClient.post<ApiResponse<LoginResponse>>(
    '/auth/login',
    payload
  );

  if (!data.data?.user) {
    throw new Error('Malformed login response');
  }

  return data.data;
};

export const refreshSession = async (refreshToken?: string) => {
  const body = refreshToken ? { refreshToken } : {};
  const { data } = await apiClient.post<ApiResponse<RefreshResponse | null>>(
    '/auth/refresh',
    body
  );
  return data.data ?? {};
};

export const logoutRequest = async (refreshToken?: string) => {
  const body = refreshToken ? { refreshToken } : {};
  await apiClient.post('/auth/logout', body);
};

