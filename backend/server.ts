import dns from 'dns';
try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch {
  // Ignore DNS override errors in environments that restrict it
}

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { apiRouter } from './routes/api';
import { initDatabase, getDatabaseStatus } from './db/mongo';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from both backend directory and root directory
dotenv.config({ path: path.resolve(__dirname, '.env') });
dotenv.config({ path: path.resolve(__dirname, '..', '.env') });
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 5000;

// Enable Cross-Origin Resource Sharing (CORS)
app.use(
  cors({
    origin: true,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// Body Parsing Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request Logger
app.use('/api', (req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`[SmartFin+ Backend] ${req.method} ${req.originalUrl} -> ${res.statusCode} (${duration}ms)`);
  });
  next();
});

// Root API Welcome Check
app.get('/', (req, res) => {
  res.json({
    name: 'SmartFin+ API Backend',
    status: 'online',
    version: '2.6.4',
    endpoints: {
      health: '/api/health',
      transactions: '/api/transactions',
      accounts: '/api/accounts',
      budgets: '/api/budgets',
      goals: '/api/goals',
      notifications: '/api/notifications',
      analytics: '/api/analytics',
      auth: {
        otp: '/api/auth/send-otp',
        verify: '/api/auth/verify-otp',
        login: '/api/auth/login',
        register: '/api/auth/register',
      },
    },
  });
});

// Mount Main API Router
app.use('/api', apiRouter);

// Start Server & Database
async function startServer() {
  let dbStatus: any = null;
  try {
    dbStatus = await initDatabase();
  } catch (err: any) {
    console.error('[SmartFin+ Backend] Database initialization error:', err);
  }

  app.listen(PORT, '0.0.0.0', () => {
    const isAtlas = dbStatus?.engine === 'mongodb_atlas';
    console.log(`=================================================`);
    console.log(`🚀 SmartFin+ Backend API Server Online!`);
    console.log(`📍 URL: http://localhost:${PORT}`);
    console.log(`🔌 Health: http://localhost:${PORT}/api/health`);
    console.log(`🍃 Database: ${isAtlas ? `MongoDB Atlas Cloud (${dbStatus?.clusterHost || 'connected'})` : 'Embedded MongoDB Store (BSON / JSON)'}`);
    console.log(`⚡ Node: ${process.version}`);
    console.log(`=================================================`);
  });
}

startServer().catch((err) => {
  console.error('[SmartFin+ Backend] Fatal startup error:', err);
  process.exit(1);
});
