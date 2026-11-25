import express from 'express';
import {
  recordLocation,
  getTripTracking,
  getTripHistory,
  verifyPickup,
  verifyDropoff,
} from '../controllers/trackingController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router.post('/location', recordLocation);
router.get('/:tripId', getTripTracking);
router.get('/:tripId/history', getTripHistory);
router.post('/:tripId/verify-pickup', verifyPickup);
router.post('/:tripId/verify-dropoff', verifyDropoff);

export default router;
