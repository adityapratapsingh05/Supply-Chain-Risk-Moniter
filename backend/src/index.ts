import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { PrismaClient } from '@prisma/client';

import authRoutes from './routes/auth.routes';
import supplierRoutes from './routes/supplier.routes';
import riskRoutes from './routes/risk.routes';
import aiRoutes from './routes/ai.routes';
import notificationRoutes from './routes/notification.routes';
import adminRoutes from './routes/admin.routes';
import { notFoundHandler, errorHandler } from './middleware/errorHandler';
// import { startNewsJob } from './utils/newsJob'; // Temporarily disabled

const app = express();
const PORT = Number(process.env.PORT) || 8080;
const prisma = new PrismaClient();

// Run migrations on startup
async function runMigrations() {
  try {
    console.log('🔄 Running database migrations...');
    const { execSync } = require('child_process');
    execSync('npx prisma migrate deploy', { 
      stdio: 'inherit',
      env: { ...process.env, DATABASE_URL: process.env.DATABASE_URL, DIRECT_URL: process.env.DIRECT_URL }
    });
    console.log('✅ Database migrations complete');
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

// Security
app.set('trust proxy', 1);
app.use(helmet());

app.use(
  cors({
    origin: process.env.CLIENT_URL || '*',
    credentials: true,
  })
);

app.use(express.json({ limit: '2mb' }));

const globalLimiter = rateLimit({
  windowMs: Number(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
  max: Number(process.env.RATE_LIMIT_MAX) || 300,
  skip: (req) => process.env.NODE_ENV !== 'production',
});

app.use(globalLimiter);

// Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
  });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/suppliers', supplierRoutes);
app.use('/api/risk', riskRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/admin', adminRoutes);

// Error Handlers
app.use(notFoundHandler);
app.use(errorHandler);

// Start Server
async function start() {
  await runMigrations();
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Supply Chain Risk Monitor API listening on port ${PORT}`);

    // Temporarily disabled until deployment is complete.
    // Uncomment after configuring NEWSAPI_KEY.
    // startNewsJob();
  });
}

start().catch((error) => {
  console.error('Failed to start server:', error);
  process.exit(1);
});