import { Response } from 'express';
import '../models'; // Ensure models are loaded
import { AuthRequest } from '../middlewares/auth';
import User, { UserRole } from '../models/user';
import { successResponse, errorResponse } from '../utils/responses';
import logger from '../utils/logger';

export const getDoctors = async (req: AuthRequest, res: Response) => {
  try {
    const doctors = await User.findAll({
      where: { role: UserRole.DOCTOR },
      attributes: ['id', 'full_name', 'email'],
      order: [['full_name', 'ASC']],
    });

    return successResponse(res, doctors, 'Doctors retrieved successfully');
  } catch (error: any) {
    logger.error('Get doctors error:', error);
    return errorResponse(res, 'Failed to retrieve doctors', 500);
  }
};

export const getProfile = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    
    const user = await User.findByPk(userId, {
      attributes: ['id', 'full_name', 'email', 'role', 'created_at'],
    });

    if (!user) {
      return errorResponse(res, 'User not found', 404);
    }

    return successResponse(res, user, 'Profile retrieved successfully');
  } catch (error: any) {
    logger.error('Get profile error:', error);
    return errorResponse(res, 'Failed to retrieve profile', 500);
  }
};

