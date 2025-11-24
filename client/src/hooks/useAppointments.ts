import { useMemo } from 'react';
import {
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import type { AxiosError } from 'axios';
import toast from 'react-hot-toast';

import {
  addTreatment,
  createAppointment,
  deleteTreatment,
  fetchDoctorAppointments,
  fetchPatientAppointments,
  finishAppointment,
  startAppointment,
} from '../api/appointments';
import type { Appointment, TreatmentPayload } from '../types/api';
import { useAuth } from './useAuth';

const queryKeys = {
  patientAppointments: (patientId?: string) => [
    'patient-appointments',
    patientId,
  ],
  doctorAppointments: (doctorId?: string) => [
    'doctor-appointments',
    doctorId,
  ],
};

export const usePatientAppointments = () => {
  const { user } = useAuth();
  return useQuery({
    queryKey: queryKeys.patientAppointments(user?.id),
    queryFn: () => fetchPatientAppointments(user!.id),
    enabled: Boolean(user?.id),
  });
};

export const useDoctorAppointments = () => {
  const { user } = useAuth();
  return useQuery({
    queryKey: queryKeys.doctorAppointments(user?.id),
    queryFn: () => fetchDoctorAppointments(user!.id),
    enabled: Boolean(user?.id),
  });
};

export const useAppointmentActions = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const invalidatePatient = () => {
    if (user?.id) {
      queryClient.invalidateQueries({
        queryKey: queryKeys.patientAppointments(user.id),
      });
    }
  };

  const invalidateDoctor = () => {
    if (user?.id) {
      queryClient.invalidateQueries({
        queryKey: queryKeys.doctorAppointments(user.id),
      });
    }
  };

  const createAppointmentMutation = useMutation({
    mutationFn: (payload: { doctorId: string; datetime: string }) =>
      createAppointment(user!.id, {
        doctor_id: payload.doctorId,
        scheduled_time: payload.datetime,
      }),
    onSuccess: () => {
      toast.success('Appointment scheduled!');
      invalidatePatient();
    },
    onError: (error: AxiosError<{ message?: string }>) => {
      const message = error.response?.data?.message;
      toast.error(message ?? 'Unable to create appointment');
    },
  });

  const startMutation = useMutation({
    mutationFn: (appointmentId: string) => startAppointment(appointmentId),
    onSuccess: (appointment) => {
      toast.success('Visit started');
      queryClient.invalidateQueries({
        queryKey: queryKeys.doctorAppointments(appointment.doctor_id),
      });
    },
    onError: (error: AxiosError<{ message?: string }>) => {
      const message = error.response?.data?.message;
      if (error.response?.status === 409) {
        toast.error(message ?? 'Another visit is already in progress');
      } else {
        toast.error(message ?? 'Unable to start appointment');
      }
    },
  });

  const finishMutation = useMutation({
    mutationFn: (appointmentId: string) => finishAppointment(appointmentId),
    onSuccess: (appointment) => {
      toast.success('Visit finished');
      queryClient.invalidateQueries({
        queryKey: queryKeys.doctorAppointments(appointment.doctor_id),
      });
      // Invalidate finance search queries to refresh data in finance page
      queryClient.invalidateQueries({
        queryKey: ['finance-search'],
      });
    },
    onError: () => {
      toast.error('Unable to finish appointment');
    },
  });

  const treatmentMutation = useMutation({
    mutationFn: ({
      appointmentId,
      payload,
    }: {
      appointmentId: string;
      payload: TreatmentPayload;
    }) => addTreatment(appointmentId, payload),
    onSuccess: ({ doctor_id }) => {
      toast.success('Treatment added');
      queryClient.invalidateQueries({
        queryKey: queryKeys.doctorAppointments(doctor_id),
      });
      // Invalidate finance search queries to refresh data in finance page
      queryClient.invalidateQueries({
        queryKey: ['finance-search'],
      });
    },
    onError: (error: AxiosError<{ message?: string }>) => {
      const message = error.response?.data?.message;
      toast.error(message ?? 'Unable to add treatment');
    },
  });

  const deleteTreatmentMutation = useMutation({
    mutationFn: ({
      appointmentId,
      treatmentId,
    }: {
      appointmentId: string;
      treatmentId: string;
    }) => deleteTreatment(appointmentId, treatmentId),
    onSuccess: (response: { doctor_id: string }) => {
      toast.success('Treatment removed');
      queryClient.invalidateQueries({
        queryKey: queryKeys.doctorAppointments(response.doctor_id),
      });
      // Invalidate finance search queries to refresh data in finance page
      queryClient.invalidateQueries({
        queryKey: ['finance-search'],
      });
    },
    onError: () => toast.error('Unable to remove treatment'),
  });

  return useMemo(
    () => ({
      createAppointment: createAppointmentMutation,
      startAppointment: startMutation,
      finishAppointment: finishMutation,
      addTreatment: treatmentMutation,
      deleteTreatment: deleteTreatmentMutation,
    }),
    [
      createAppointmentMutation,
      startMutation,
      finishMutation,
      treatmentMutation,
      deleteTreatmentMutation,
    ]
  );
};

export const findAppointmentById = (
  appointments: Appointment[] | undefined,
  id?: string
) => appointments?.find((appointment) => appointment.id === id);

