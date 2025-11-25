import { Request, Response } from 'express';
import { AuthService } from '../services/auth.service';
import { successResponse, errorResponse } from '../utils/responses';
import logger from '../utils/logger';
import { User } from '@/models';

const authService = new AuthService();

export const signup = async (req: Request, res: Response) => {
  try {
    const { full_name, email, password, role } = req.body;
    
    if (!full_name || !email || !password) {
      return errorResponse(res, 'Full name, email, and password are required', 400);
    }
    
    const emailExist = await User.findOne({
      where: { email: email },
    });
    if (emailExist) {
      return errorResponse(res, 'This email is already registered. Please sign in instead.', 409);
    }
    
    const user = await authService.signup(full_name, email, password, role);
    
    const { password_hash, ...userResponse } = user.toJSON();
    
    return successResponse(res, userResponse, 'User created successfully', 201);
  } catch (error: any) {
    logger.error('Signup error:', error);
    return errorResponse(res, 'Failed to create account. Please try again later.', 500);
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return errorResponse(res, 'Email and password are required', 400);
    }
    
    const { user, tokens } = await authService.login(email, password);
    
    const { password_hash, ...userResponse } = user.toJSON();
    
    const isProduction = process.env.NODE_ENV === 'production';
    
    res.cookie('accessToken', tokens.accessToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'lax',
      maxAge: 15 * 60 * 1000,
    });
    
    res.cookie('refreshToken', tokens.refreshToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    
    return successResponse(res, {
      user: userResponse,
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    }, 'Login successful');
  } catch (error: any) {
    logger.error('Login error:', error);
    if (error.message === 'Invalid email or password') {
      return errorResponse(res, error.message, 401);
    }
    return errorResponse(res, 'Login failed. Please try again later.', 500);
  }
};

export const refresh = async (req: Request, res: Response) => {
  try {
    const refreshToken = req.cookies?.refreshToken || req.body?.refreshToken;
    
    if (!refreshToken) {
      return errorResponse(res, 'Refresh token not provided', 401);
    }
    
    const tokens = await authService.refreshToken(refreshToken);
    
    const isProduction = process.env.NODE_ENV === 'production';
    
    res.cookie('accessToken', tokens.accessToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'lax',
      maxAge: 15 * 60 * 1000,
    });
    
    res.cookie('refreshToken', tokens.refreshToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    
    return successResponse(res, {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    }, 'Token refreshed successfully');
  } catch (error: any) {
    logger.error('Refresh token error:', error);
    if (error.message === 'Invalid or expired refresh token' || error.message === 'Invalid refresh token') {
      return errorResponse(res, 'Invalid or expired refresh token', 401);
    }
    return errorResponse(res, 'Failed to refresh token. Please try again later.', 500);
  }
};

export const logout = async (req: Request, res: Response) => {
  try {
    const refreshToken = req.cookies?.refreshToken || req.body?.refreshToken;
    
    if (refreshToken) {
      await authService.logout(refreshToken);
    }
    
    res.clearCookie('accessToken');
    res.clearCookie('refreshToken');
    
    return successResponse(res, null, 'Logout successful');
  } catch (error: any) {
    logger.error('Logout error:', error);
    res.clearCookie('accessToken');
    res.clearCookie('refreshToken');
    return errorResponse(res, 'Logout failed. Please try again later.', 500);
  }
};

