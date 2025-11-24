import { Request, Response, NextFunction } from 'express';
import logger from '../utils/logger';
import { errorResponse } from '../utils/responses';

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  logger.error(err);

  if (err.name === 'SequelizeValidationError') {
    const errors: Record<string, string[]> = {};
    (err as any).errors.forEach((error: any) => {
      const field = error.path || 'unknown';
      if (!errors[field]) {
        errors[field] = [];
      }
      errors[field].push(error.message);
    });
    return errorResponse(res, 'Validation error', 400, errors);
  }

  if (err.name === 'SequelizeUniqueConstraintError') {
    return errorResponse(res, 'Duplicate entry', 409);
  }

  if (err.name === 'SequelizeForeignKeyConstraintError') {
    return errorResponse(res, 'Invalid reference', 400);
  }

  return errorResponse(res, 'Internal server error', 500);
};

