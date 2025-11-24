import { apiClient } from './axios';
import type { ApiResponse, User } from '../types/api';

export const fetchDoctors = async () => {
  const { data } = await apiClient.get<ApiResponse<User[]>>('/doctors');
  return data.data;
};

export const fetchProfile = async () => {
  const { data } = await apiClient.get<ApiResponse<User>>('/profile');
  return data.data;
};

