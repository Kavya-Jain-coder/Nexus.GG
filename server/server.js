// server/server.js
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.js';
import matchRoutes from './routes/matches.js';
import coachingRoutes from './routes/coaching.js';
import progressRoutes from './routes/progress.js';
import { errorHandler } from './middleware/errorHandler.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middlewares
app.use(cors({
  origin: '*', // Allow all origins for flex local testing, restrict in prod
  credentials: true
}));
app.use(express.json());

// Routes Bindings
app.use('/api/auth', authRoutes);
app.use('/api/matches', matchRoutes);
app.use('/api/coaching', coachingRoutes);
app.use('/api/progress', progressRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  });
});

// Error handling Middleware (Must be last)
app.use(errorHandler);

// Launch server listener
app.listen(PORT, () => {
  console.log(`===============================================`);
  console.log(`  NEXUS.GG AI Game Coaching OS Server Running   `);
  console.log(`  PORT: ${PORT}                                 `);
  console.log(`  ENV:  ${process.env.NODE_ENV || 'development'}`);
  console.log(`===============================================`);
});
export default app;
