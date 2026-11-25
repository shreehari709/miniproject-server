import express from 'express';
import {
  getDashboardKPIs,
  getFleetAnalytics,
  getAmbulanceAnalytics,
} from '../controllers/analyticsController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router.get('/dashboard', getDashboardKPIs);
router.get('/fleet', getFleetAnalytics);
router.get('/ambulance', getAmbulanceAnalytics);

export default router;
