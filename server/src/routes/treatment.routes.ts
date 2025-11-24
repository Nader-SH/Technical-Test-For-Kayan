import { Router } from 'express';
import * as treatmentController from '../controllers/treatment.controller';
import { authenticate } from '../middlewares/auth';
import { authorize } from '../middlewares/roles';
import { UserRole } from '../models/user';
import { validate } from '../middlewares/validate';
import { createTreatmentSchema } from '../validators/treatment.schema';

const router = Router();

router.post(
  '/appointments/:id/treatments',
  authenticate,
  authorize(UserRole.DOCTOR),
  validate(createTreatmentSchema),
  treatmentController.createTreatment
);

router.delete(
  '/appointments/:id/treatments/:treatmentId',
  authenticate,
  authorize(UserRole.DOCTOR),
  treatmentController.deleteTreatment
);

export default router;

