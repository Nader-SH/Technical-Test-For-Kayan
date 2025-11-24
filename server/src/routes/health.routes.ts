import { Router } from 'express';
import { Request, Response } from 'express';
import sequelize from '../config/db';
import { successResponse } from '../utils/responses';

const router = Router();

router.get('/health', async (req: Request, res: Response) => {
  try {
    await sequelize.authenticate();
    return successResponse(res, {
      status: 'healthy',
      database: 'connected',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return res.status(503).json({
      success: false,
      status: 'unhealthy',
      database: 'disconnected',
      timestamp: new Date().toISOString(),
    });
  }
});

router.get('/metrics', (req: Request, res: Response) => {
  return successResponse(res, {
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    timestamp: new Date().toISOString(),
  });
});

export default router;

