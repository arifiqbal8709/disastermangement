import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import path from 'path';
import { fileURLToPath } from 'url';

import { config } from './src/config/env.js';
import { logger } from './src/utils/logger.js';
import { apiLimiter } from './src/middleware/rateLimiter.js';
import { errorHandler, notFoundHandler } from './src/middleware/errorHandler.js';

// Route Imports
import authRoutes from './src/routes/authRoutes.js';
import reportRoutes from './src/routes/reportRoutes.js';
import districtRoutes from './src/routes/districtRoutes.js';
import incidentRoutes from './src/routes/incidentRoutes.js';
import resourceRoutes from './src/routes/resourceRoutes.js';
import actionPlanRoutes from './src/routes/actionPlanRoutes.js';
import statsRoutes from './src/routes/statsRoutes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Security Middlewares
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

const allowedOrigins = [
  config.corsOrigin,
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:3000'
];

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (e.g. mobile apps, curl)
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(null, true); // Permissive in dev to avoid blocking frontend ports
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Body Parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging
app.use(morgan('dev'));

// Static File Access for Uploads (Private document reference)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Apply General Rate Limiter to all API routes
app.use('/api', apiLimiter);

// Health Check Endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    system: 'RESILIENCE AI Backend Intelligence Engine',
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  });
});

// REST API Routes Mount
app.use('/api/auth', authRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/districts', districtRoutes);
app.use('/api/incidents', incidentRoutes);
app.use('/api/resources', resourceRoutes);
app.use('/api/action-plans', actionPlanRoutes);
app.use('/api/stats', statsRoutes);

// Catch 404 & Centralized Error Handler
app.use(notFoundHandler);
app.use(errorHandler);

// Start Server
const PORT = config.port;
const server = app.listen(PORT, () => {
  logger.info(`================================================================`);
  logger.info(`  RESILIENCE AI — Disaster Intelligence Backend Engine`);
  logger.info(`  Port: ${PORT} | Environment: ${config.nodeEnv}`);
  logger.info(`  Health Check: http://localhost:${PORT}/api/health`);
  logger.info(`================================================================`);
});

export default app;
