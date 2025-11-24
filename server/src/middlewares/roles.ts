import { Response, NextFunction } from 'express';
import { AuthRequest } from './auth';
import { UserRole } from '../models/user';
import { errorResponse } from '../utils/responses';

export const authorize = (...allowedRoles: UserRole[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return errorResponse(res, 'Authentication required', 401);
    }

    if (!allowedRoles.includes(req.user.role)) {
      return errorResponse(res, 'Insufficient permissions', 403);
    }

    next();
  };
};

