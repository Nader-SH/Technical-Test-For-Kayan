import * as yup from 'yup';

export const reviewAppointmentSchema = yup.object().shape({
  approved: yup.boolean().required('Approval status is required'),
  notes: yup.string().nullable(),
});

export const searchAppointmentsSchema = yup.object().shape({
  doctor: yup.string(),
  patient: yup.string(),
  appointmentId: yup.string().uuid('Invalid appointment ID format'),
  status: yup.string().oneOf(['scheduled', 'in_progress', 'completed', 'cancelled']),
  from: yup.date().typeError('Invalid date format'),
  to: yup.date().typeError('Invalid date format'),
  limit: yup.number().integer().positive().max(100).default(20),
  page: yup.number().integer().min(1).default(1),
});

