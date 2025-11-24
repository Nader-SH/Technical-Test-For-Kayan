import * as yup from 'yup';

export const reviewAppointmentSchema = yup.object().shape({
  approved: yup.boolean().required('Approval status is required'),
  notes: yup.string().nullable(),
});

export const searchAppointmentsSchema = yup.object().shape({
  doctor: yup.string().optional(),
  patient: yup.string().optional(),
  appointmentId: yup.string().uuid('Invalid appointment ID format').optional(),
  status: yup.string().oneOf(['scheduled', 'in_progress', 'completed', 'cancelled']).optional(),
  from: yup.string().optional(),
  to: yup.string().optional(),
  limit: yup.number().integer().positive().max(100).optional(),
  page: yup.number().integer().min(1).optional(),
});

