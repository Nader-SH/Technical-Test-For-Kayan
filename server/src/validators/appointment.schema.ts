import * as yup from 'yup';

export const createAppointmentSchema = yup.object().shape({
  doctor_id: yup.string().uuid('Invalid doctor ID format').required('Doctor ID is required'),
  scheduled_time: yup.date().required('Scheduled time is required').min(new Date(), 'Scheduled time must be in the future'),
});

export const createAppointmentForDoctorSchema = yup.object().shape({
  patient_id: yup.string().uuid('Invalid patient ID format').required('Patient ID is required'),
  scheduled_time: yup.date().required('Scheduled time is required').min(new Date(), 'Scheduled time must be in the future'),
});

export const startAppointmentSchema = yup.object().shape({});

export const finishAppointmentSchema = yup.object().shape({});

