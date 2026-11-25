import express from 'express';
import {
  getTrips,
  getTripById,
  createTrip,
  updateTripMilestone,
  completeTrip,
  cancelTrip,
} from '../controllers/tripController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router.get('/', getTrips);
router.get('/:id', getTripById);
router.post('/', authorize('super_admin', 'fleet_manager', 'dispatcher'), createTrip);
router.post('/:id/milestone', updateTripMilestone);
router.post('/:id/complete', completeTrip);
router.post('/:id/cancel', authorize('super_admin', 'fleet_manager', 'dispatcher'), cancelTrip);

export default router;
