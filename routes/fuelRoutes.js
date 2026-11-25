import express from 'express';
import { getFuelLogs, createFuelLog } from '../controllers/expenseController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router.get('/', getFuelLogs);
router.post('/', authorize('super_admin', 'fleet_manager', 'driver', 'financial_analyst'), createFuelLog);

export default router;
