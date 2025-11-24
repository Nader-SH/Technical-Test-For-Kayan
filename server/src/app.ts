import express, { Application } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
// @ts-expect-error - xss-clean has no type definitions
import xss from 'xss-clean';
import pinoHttp from 'pino-http';
import logger from './utils/logger';
import { errorHandler } from './middlewares/errorHandler';
// Import models to ensure associations are loaded
import './models';
import authRoutes from './routes/auth.routes';
import appointmentRoutes from './routes/appointment.routes';
import treatmentRoutes from './routes/treatment.routes';
import financeRoutes from './routes/finance.routes';
import userRoutes from './routes/user.routes';
import healthRoutes from './routes/health.routes';

const app: Application = express();

// Security middlewares
app.use(helmet());
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
    credentials: true,
  })
);
app.use(xss());
app.disable('x-powered-by');

// Rate limiting - more lenient in development
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.NODE_ENV === 'production' ? 100 : 1000, // Higher limit in development
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  skip: (req) => {
    // Skip rate limiting for health checks
    return req.path === '/health' || req.path === '/metrics';
  },
});

// Apply rate limiting to all routes except auth (auth has its own stricter rate limiting)
app.use((req, res, next) => {
  // Skip rate limiting for auth routes (they have their own rate limiting)
  if (req.path.startsWith('/auth')) {
    return next();
  }
  return limiter(req, res, next);
});

// Cookie parser (must be before body parsing)
app.use(cookieParser());

// Body parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logging
app.use(pinoHttp({ logger }));

// Routes
app.use('/auth', authRoutes);
app.use('/', appointmentRoutes);
app.use('/', treatmentRoutes);
app.use('/', financeRoutes);
app.use('/', userRoutes);
app.use('/', healthRoutes);


app.use(errorHandler);

export default app;

