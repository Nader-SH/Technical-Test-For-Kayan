import { Router } from 'express';
import * as userController from '../controllers/user.controller';
import { authenticate } from '../middlewares/auth';

const router = Router();

router.get(
  '/doctors',
  authenticate,
  userController.getDoctors
);

router.get(
  '/profile',
  authenticate,
  userController.getProfile
);

export default router;

