import { Router } from 'express';
import * as userController from '../controllers/user.controller';
import { authenticate } from '../middlewares/auth';

const router = Router();

// Get all doctors (available to all authenticated users)
router.get(
  '/doctors',
  authenticate,
  userController.getDoctors
);

// Get current user profile
router.get(
  '/profile',
  authenticate,
  userController.getProfile
);

export default router;

