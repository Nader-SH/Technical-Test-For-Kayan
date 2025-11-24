import { apiClient } from './axios';
import type {
  ApiResponse,
  Appointment,
  AppointmentPayload,
  Treatment,
  TreatmentPayload,
} from '../types/api';

export const createAppointment = async (
  patientId: string,
  payload: AppointmentPayload
) => {
  const { data } = await apiClient.post<ApiResponse<Appointment>>(
    `/patients/${patientId}/appointments`,
    payload
  );
  return data.data;
};

export const fetchPatientAppointments = async (patientId: string) => {
  const { data } = await apiClient.get<ApiResponse<Appointment[]>>(
    `/patients/${patientId}/appointments`
  );
  return data.data;
};

export const fetchDoctorAppointments = async (doctorId: string) => {
  const { data } = await apiClient.get<ApiResponse<Appointment[]>>(
    `/doctors/${doctorId}/appointments`
  );
  return data.data;
};

export const startAppointment = async (appointmentId: string) => {
  const { data } = await apiClient.post<ApiResponse<Appointment>>(
    `/appointments/${appointmentId}/start`
  );
  return data.data;
};

export const finishAppointment = async (appointmentId: string) => {
  const { data } = await apiClient.post<ApiResponse<Appointment>>(
    `/appointments/${appointmentId}/finish`
  );
  return data.data;
};

export const addTreatment = async (
  appointmentId: string,
  payload: TreatmentPayload
) => {
  const { data } = await apiClient.post<ApiResponse<Treatment & { doctor_id: string }>>(
    `/appointments/${appointmentId}/treatments`,
    payload
  );
  return data.data;
};

export const deleteTreatment = async (
  appointmentId: string,
  treatmentId: string
) => {
  const { data } = await apiClient.delete<ApiResponse<{ doctor_id: string }>>(
    `/appointments/${appointmentId}/treatments/${treatmentId}`
  );
  return data.data;
};

