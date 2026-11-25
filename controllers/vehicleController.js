import Vehicle from '../models/Vehicle.js';
import Trip from '../models/Trip.js';
import MaintenanceLog from '../models/MaintenanceLog.js';
import FuelLog from '../models/FuelLog.js';
import Expense from '../models/Expense.js';

// @desc    Get all vehicles with optional filters, search, sort, pagination
// @route   GET /api/vehicles
// @access  Private
export const getVehicles = async (req, res, next) => {
  try {
    const { status, type, region, search, sort, page = 1, limit = 50 } = req.query;

    const query = {};

    if (status) query.status = status;
    if (type) query.type = type;
    if (region) query.region = region;

    if (search) {
      query.$or = [
        { registrationNumber: { $regex: search, $options: 'i' } },
        { name: { $regex: search, $options: 'i' } },
        { manufacturer: { $regex: search, $options: 'i' } },
      ];
    }

    let sortOption = { createdAt: -1 };
    if (sort === 'odometer_asc') sortOption = { odometer: 1 };
    if (sort === 'odometer_desc') sortOption = { odometer: -1 };
    if (sort === 'name_asc') sortOption = { name: 1 };
    if (sort === 'reg_asc') sortOption = { registrationNumber: 1 };

    const total = await Vehicle.countDocuments(query);
    const vehicles = await Vehicle.find(query)
      .sort(sortOption)
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.json({
      success: true,
      count: vehicles.length,
      total,
      vehicles,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get available vehicles eligible for dispatch (NOT In Shop, NOT Retired, NOT On Trip)
// @route   GET /api/vehicles/available
// @access  Private
export const getAvailableVehicles = async (req, res, next) => {
  try {
    const { type } = req.query;
    const query = { status: 'Available' };
    if (type) query.type = type;

    const vehicles = await Vehicle.find(query).sort({ name: 1 });
    res.json({
      success: true,
      vehicles,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single vehicle details + recent histories
// @route   GET /api/vehicles/:id
// @access  Private
export const getVehicleById = async (req, res, next) => {
  try {
    const vehicle = await Vehicle.findById(req.params.id);
    if (!vehicle) {
      return res.status(404).json({ success: false, message: 'Vehicle not found' });
    }

    // Fetch related records
    const trips = await Trip.find({ vehicle: vehicle._id })
      .sort({ createdAt: -1 })
      .limit(10)
      .populate('driver', 'fullName phone');

    const maintenance = await MaintenanceLog.find({ vehicle: vehicle._id })
      .sort({ reportedDate: -1 })
      .limit(10);

    const fuelLogs = await FuelLog.find({ vehicle: vehicle._id })
      .sort({ date: -1 })
      .limit(10);

    const expenses = await Expense.find({ vehicle: vehicle._id })
      .sort({ date: -1 })
      .limit(10);

    res.json({
      success: true,
      vehicle,
      history: {
        trips,
        maintenance,
        fuelLogs,
        expenses,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new vehicle
// @route   POST /api/vehicles
// @access  Private (Admin, Fleet Manager)
export const createVehicle = async (req, res, next) => {
  try {
    const { registrationNumber } = req.body;

    const exists = await Vehicle.findOne({
      registrationNumber: registrationNumber.toUpperCase().trim(),
    });
    if (exists) {
      return res.status(400).json({
        success: false,
        message: 'A vehicle with this registration number already exists',
      });
    }

    const vehicle = await Vehicle.create(req.body);

    res.status(201).json({
      success: true,
      message: 'Vehicle registered successfully',
      vehicle,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update vehicle
// @route   PUT /api/vehicles/:id
// @access  Private (Admin, Fleet Manager)
export const updateVehicle = async (req, res, next) => {
  try {
    let vehicle = await Vehicle.findById(req.params.id);
    if (!vehicle) {
      return res.status(404).json({ success: false, message: 'Vehicle not found' });
    }

    // Check if updating registration number to another vehicle's reg
    if (req.body.registrationNumber && req.body.registrationNumber !== vehicle.registrationNumber) {
      const exists = await Vehicle.findOne({
        registrationNumber: req.body.registrationNumber.toUpperCase().trim(),
      });
      if (exists) {
        return res.status(400).json({
          success: false,
          message: 'Another vehicle already uses this registration number',
        });
      }
    }

    vehicle = await Vehicle.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.json({
      success: true,
      message: 'Vehicle updated successfully',
      vehicle,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete vehicle
// @route   DELETE /api/vehicles/:id
// @access  Private (Super Admin)
export const deleteVehicle = async (req, res, next) => {
  try {
    const vehicle = await Vehicle.findById(req.params.id);
    if (!vehicle) {
      return res.status(404).json({ success: false, message: 'Vehicle not found' });
    }

    // Business rule: Do not delete if vehicle is currently on trip
    if (vehicle.status === 'On Trip') {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete a vehicle currently on an active trip. Complete or cancel the trip first.',
      });
    }

    await Vehicle.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Vehicle deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};
