import { Router } from 'express';
import * as financeController from '../controllers/finance.controller';
import { authenticate } from '../middlewares/auth';
import { authorize } from '../middlewares/roles';
import { UserRole } from '../models/user';
import { validate } from '../middlewares/validate';
import {
  searchAppointmentsSchema,
  reviewAppointmentSchema,
} from '../validators/finance.schema';

const router = Router();

router.get(
  '/finance/appointments',
  authenticate,
  authorize(UserRole.FINANCE),
  validate(searchAppointmentsSchema),
  financeController.searchAppointments
);

router.post(
  '/finance/appointments/:id/review',
  authenticate,
  authorize(UserRole.FINANCE),
  validate(reviewAppointmentSchema),
  financeController.reviewAppointment
);

export default router;

