import express from 'express';
import {
  createAmbulanceRequest,
  getAmbulanceRequests,
  getAmbulanceRequestById,
  approveAmbulanceRequest,
  assignAmbulanceAndDriver,
  rejectAmbulanceRequest,
} from '../controllers/ambulanceController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router.post('/', createAmbulanceRequest);
router.get('/', getAmbulanceRequests);
router.get('/:id', getAmbulanceRequestById);
router.post('/:id/approve', authorize('super_admin', 'fleet_manager', 'dispatcher'), approveAmbulanceRequest);
router.post('/:id/assign', authorize('super_admin', 'fleet_manager', 'dispatcher'), assignAmbulanceAndDriver);
router.post('/:id/reject', authorize('super_admin', 'fleet_manager', 'dispatcher'), rejectAmbulanceRequest);

export default router;
