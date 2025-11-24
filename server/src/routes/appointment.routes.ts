import { Router } from 'express';
import * as appointmentController from '../controllers/appointment.controller';
import { authenticate } from '../middlewares/auth';
import { authorize } from '../middlewares/roles';
import { UserRole } from '../models/user';
import { validate } from '../middlewares/validate';
import { createAppointmentSchema, createAppointmentForDoctorSchema } from '../validators/appointment.schema';

const router = Router();

// Patient routes
router.post(
  '/patients/:patientId/appointments',
  authenticate,
  authorize(UserRole.PATIENT),
  validate(createAppointmentSchema),
  appointmentController.createAppointment
);

router.get(
  '/patients/:patientId/appointments',
  authenticate,
  appointmentController.getPatientAppointments
);

// Doctor routes
router.get(
  '/doctors/:doctorId/appointments',
  authenticate,
  appointmentController.getDoctorAppointments
);

// Allow doctors to create appointments (optional - if needed)
router.post(
  '/doctors/:doctorId/appointments',
  authenticate,
  authorize(UserRole.DOCTOR),
  validate(createAppointmentForDoctorSchema),
  appointmentController.createAppointmentForDoctor
);

router.post(
  '/appointments/:id/start',
  authenticate,
  authorize(UserRole.DOCTOR),
  appointmentController.startAppointment
);

router.post(
  '/appointments/:id/finish',
  authenticate,
  authorize(UserRole.DOCTOR),
  appointmentController.finishAppointment
);

export default router;

