import FuelLog from '../models/FuelLog.js';
import Expense from '../models/Expense.js';
import Vehicle from '../models/Vehicle.js';

// @desc    Get fuel logs
// @route   GET /api/fuel
// @access  Private
export const getFuelLogs = async (req, res, next) => {
  try {
    const { vehicleId, page = 1, limit = 50 } = req.query;
    const query = {};
    if (vehicleId) query.vehicle = vehicleId;

    const total = await FuelLog.countDocuments(query);
    const logs = await FuelLog.find(query)
      .populate('vehicle', 'name registrationNumber fuelType')
      .populate('trip', 'tripNumber')
      .sort({ date: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.json({
      success: true,
      total,
      count: logs.length,
      logs,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create fuel log
// @route   POST /api/fuel
// @access  Private
export const createFuelLog = async (req, res, next) => {
  try {
    const { vehicle: vehicleId, trip: tripId, fuelType, liters, pricePerLiter, odometerReading, fuelStation, receiptNumber } = req.body;

    const vehicle = await Vehicle.findById(vehicleId);
    if (!vehicle) return res.status(404).json({ success: false, message: 'Vehicle not found' });

    const totalCost = Number(liters) * Number(pricePerLiter);

    const log = await FuelLog.create({
      vehicle: vehicleId,
      trip: tripId || null,
      fuelType: fuelType || vehicle.fuelType,
      liters: Number(liters),
      pricePerLiter: Number(pricePerLiter),
      totalCost,
      odometerReading: Number(odometerReading),
      fuelStation,
      receiptNumber,
      date: new Date(),
    });

    // Update vehicle odometer if higher
    if (odometerReading > vehicle.odometer) {
      vehicle.odometer = odometerReading;
      await vehicle.save();
    }

    res.status(201).json({
      success: true,
      message: 'Fuel log recorded successfully',
      log,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get general expenses
// @route   GET /api/expenses
// @access  Private
export const getExpenses = async (req, res, next) => {
  try {
    const { category, vehicleId, page = 1, limit = 50 } = req.query;
    const query = {};
    if (category) query.category = category;
    if (vehicleId) query.vehicle = vehicleId;

    const total = await Expense.countDocuments(query);
    const expenses = await Expense.find(query)
      .populate('vehicle', 'name registrationNumber type')
      .populate('trip', 'tripNumber')
      .sort({ date: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.json({
      success: true,
      total,
      count: expenses.length,
      expenses,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create expense
// @route   POST /api/expenses
// @access  Private
export const createExpense = async (req, res, next) => {
  try {
    const { vehicle: vehicleId, trip: tripId, category, amount, description, receiptUrl } = req.body;

    const vehicle = await Vehicle.findById(vehicleId);
    if (!vehicle) return res.status(404).json({ success: false, message: 'Vehicle not found' });

    const expense = await Expense.create({
      vehicle: vehicleId,
      trip: tripId || null,
      category,
      amount: Number(amount),
      description,
      receiptUrl,
      recordedBy: req.user._id,
      date: new Date(),
    });

    res.status(201).json({
      success: true,
      message: 'Expense recorded successfully',
      expense,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete expense
// @route   DELETE /api/expenses/:id
// @access  Private (Admin, Financial Analyst)
export const deleteExpense = async (req, res, next) => {
  try {
    const expense = await Expense.findById(req.params.id);
    if (!expense) return res.status(404).json({ success: false, message: 'Expense record not found' });

    await Expense.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Expense deleted successfully' });
  } catch (error) {
    next(error);
  }
};
