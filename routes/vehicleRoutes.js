import express from 'express';
import {
  getVehicles,
  getAvailableVehicles,
  getVehicleById,
  createVehicle,
  updateVehicle,
  deleteVehicle,
} from '../controllers/vehicleController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router.get('/', getVehicles);
router.get('/available', getAvailableVehicles);
router.get('/:id', getVehicleById);
router.post('/', authorize('super_admin', 'fleet_manager'), createVehicle);
router.put('/:id', authorize('super_admin', 'fleet_manager'), updateVehicle);
router.delete('/:id', authorize('super_admin'), deleteVehicle);

export default router;
