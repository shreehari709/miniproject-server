import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import './config/loadEnv.js';
import { errorHandler } from './middleware/errorHandler.js';

// Route imports
import authRoutes from './routes/authRoutes.js';
import vehicleRoutes from './routes/vehicleRoutes.js';
import driverRoutes from './routes/driverRoutes.js';
import tripRoutes from './routes/tripRoutes.js';
import ambulanceRoutes from './routes/ambulanceRoutes.js';
import trackingRoutes from './routes/trackingRoutes.js';
import maintenanceRoutes from './routes/maintenanceRoutes.js';
import fuelRoutes from './routes/fuelRoutes.js';
import expenseRoutes from './routes/expenseRoutes.js';
import analyticsRoutes from './routes/analyticsRoutes.js';
import userRoutes from './routes/userRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';

const app = express();

// Middleware
app.use(cors({
  origin: (origin, callback) => callback(null, true),
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    system: 'TransitOps Enterprise API',
    timestamp: new Date().toISOString(),
  });
});

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/vehicles', vehicleRoutes);
app.use('/api/drivers', driverRoutes);
app.use('/api/trips', tripRoutes);
app.use('/api/ambulance-requests', ambulanceRoutes);
app.use('/api/tracking', trackingRoutes);
app.use('/api/maintenance', maintenanceRoutes);
app.use('/api/fuel', fuelRoutes);
app.use('/api/expenses', expenseRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/users', userRoutes);
app.use('/api/notifications', notificationRoutes);

// Central error handler
app.use(errorHandler);

export default app;
