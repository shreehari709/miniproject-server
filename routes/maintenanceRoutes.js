import express from 'express';
import {
  getMaintenanceLogs,
  createMaintenanceLog,
  updateMaintenanceLog,
  closeMaintenanceLog,
} from '../controllers/maintenanceController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router.get('/', getMaintenanceLogs);
router.post('/', authorize('super_admin', 'fleet_manager'), createMaintenanceLog);
router.put('/:id', authorize('super_admin', 'fleet_manager'), updateMaintenanceLog);
router.post('/:id/close', authorize('super_admin', 'fleet_manager'), closeMaintenanceLog);

export default router;
