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
import authRoutes from './routes/auth.routes';
import appointmentRoutes from './routes/appointment.routes';
import treatmentRoutes from './routes/treatment.routes';
import financeRoutes from './routes/finance.routes';
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

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
});
app.use(limiter);

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
app.use('/', healthRoutes);


app.use(errorHandler);

export default app;

