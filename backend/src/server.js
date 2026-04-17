import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import prisma from './config/prisma.js';

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
const allowedOrigins = [
  process.env.FRONTEND_URL,
  'http://localhost:5173',
  'http://localhost:5174'
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    // allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) !== -1 || origin.startsWith('http://localhost:')) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));
app.use(express.json());

// Basic Health Check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date() });
});

// Serve static project uploads securely
app.use('/uploads', express.static(path.join(__dirname, '../../uploads')));

// Import Routes
import authRoutes from './routes/auth.js';
import projectRoutes from './routes/projects.js';
import gradingRoutes from './routes/grading.js';
import systemRoutes from './routes/system.js';
import peerReviewRoutes from './routes/peerReviews.js';
import analyticsRoutes from './routes/analytics.js';
import rubricRoutes from './routes/rubrics.js';
import adminRoutes from './routes/admin.js';

// Setup Routes
app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/grading', gradingRoutes);
app.use('/api/system', systemRoutes);
app.use('/api/peer-reviews', peerReviewRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/rubrics', rubricRoutes);
app.use('/api/admin', adminRoutes);

// Error Handling Middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Start Server
const server = app.listen(PORT, () => {
  console.log(`🚀 SPMES Backend running on http://localhost:${PORT}`);
});

// Graceful Shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
  });
  await prisma.$disconnect();
});
