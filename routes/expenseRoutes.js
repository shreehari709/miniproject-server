import express from 'express';
import {
  getExpenses,
  createExpense,
  deleteExpense,
} from '../controllers/expenseController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router.get('/', getExpenses);
router.post('/', authorize('super_admin', 'fleet_manager', 'financial_analyst', 'driver'), createExpense);
router.delete('/:id', authorize('super_admin', 'financial_analyst'), deleteExpense);

export default router;
