import { Request, Response, NextFunction } from 'express';
import * as yup from 'yup';
import { errorResponse } from '../utils/responses';

export const validate = (schema: yup.AnySchema) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const validated = await schema.validate(
        {
          ...req.body,
          ...req.query,
          ...req.params,
        },
        { abortEarly: false, stripUnknown: true }
      );

      // Apply validated values back to request
      Object.keys(validated).forEach((key) => {
        if (req.body[key] !== undefined) req.body[key] = validated[key];
        if (req.query[key] !== undefined) req.query[key] = validated[key];
        if (req.params[key] !== undefined) req.params[key] = validated[key];
      });

      next();
    } catch (error) {
      if (error instanceof yup.ValidationError) {
        const errors: Record<string, string[]> = {};
        error.inner.forEach((err) => {
          const path = err.path || 'unknown';
          if (!errors[path]) {
            errors[path] = [];
          }
          errors[path].push(err.message);
        });
        return errorResponse(res, 'Validation failed', 400, errors);
      }
      return errorResponse(res, 'Validation error', 400);
    }
  };
};

