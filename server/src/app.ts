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
import './models';
import authRoutes from './routes/auth.routes';
import appointmentRoutes from './routes/appointment.routes';
import treatmentRoutes from './routes/treatment.routes';
import financeRoutes from './routes/finance.routes';
import userRoutes from './routes/user.routes';
import healthRoutes from './routes/health.routes';

const app: Application = express();

app.use(helmet());
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
    credentials: true,
  })
);
app.use(xss());
app.disable('x-powered-by');

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: process.env.NODE_ENV === 'production' ? 100 : 1000,
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    return req.path === '/health' || req.path === '/metrics';
  },
});

app.use((req, res, next) => {
  if (req.path.startsWith('/auth')) {
    return next();
  }
  return limiter(req, res, next);
});

app.use(cookieParser());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(pinoHttp({ logger }));

app.use('/auth', authRoutes);
app.use('/', appointmentRoutes);
app.use('/', treatmentRoutes);
app.use('/', financeRoutes);
app.use('/', userRoutes);
app.use('/', healthRoutes);


app.use(errorHandler);

export default app;

