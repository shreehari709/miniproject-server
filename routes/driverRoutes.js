import express from 'express';
import {
  getDrivers,
  getAvailableDrivers,
  getDriverById,
  createDriver,
  updateDriver,
  deleteDriver,
} from '../controllers/driverController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router.get('/', getDrivers);
router.get('/available', getAvailableDrivers);
router.get('/:id', getDriverById);
router.post('/', authorize('super_admin', 'fleet_manager'), createDriver);
router.put('/:id', authorize('super_admin', 'fleet_manager', 'safety_officer'), updateDriver);
router.delete('/:id', authorize('super_admin'), deleteDriver);

export default router;
