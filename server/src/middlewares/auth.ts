import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { jwtConfig } from '../config/jwt';
import User, { UserRole } from '../models/user';
import { errorResponse } from '../utils/responses';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: UserRole;
  };
}

export const authenticate = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    let token: string | undefined;
    
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7);
    } else if (req.cookies?.accessToken) {
      token = req.cookies.accessToken;
    }
    
    if (!token) {
      return errorResponse(res, 'No token provided', 401);
    }
    const decoded = jwt.verify(token, jwtConfig.accessSecret) as {
      id: string;
      email: string;
      role: UserRole;
    };

    const user = await User.findByPk(decoded.id);
    if (!user) {
      return errorResponse(res, 'User not found', 401);
    }

    req.user = {
      id: decoded.id,
      email: decoded.email,
      role: decoded.role,
    };

    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      return errorResponse(res, 'Invalid token', 401);
    }
    if (error instanceof jwt.TokenExpiredError) {
      return errorResponse(res, 'Token expired', 401);
    }
    return errorResponse(res, 'Authentication failed', 401);
  }
};

