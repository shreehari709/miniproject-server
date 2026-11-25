import Trip from '../models/Trip.js';
import Vehicle from '../models/Vehicle.js';
import Driver from '../models/Driver.js';
import AmbulanceRequest from '../models/AmbulanceRequest.js';
import Expense from '../models/Expense.js';
import FuelLog from '../models/FuelLog.js';
import Notification from '../models/Notification.js';

// @desc    Get all trips with filters
// @route   GET /api/trips
// @access  Private
export const getTrips = async (req, res, next) => {
  try {
    const { status, tripType, vehicle, driver, page = 1, limit = 50 } = req.query;

    const query = {};
    if (status) query.status = status;
    if (tripType) query.tripType = tripType;
    if (vehicle) query.vehicle = vehicle;
    if (driver) query.driver = driver;

    // Students only see their own trips
    if (req.user.role === 'student') {
      query.student = req.user._id;
    }

    const total = await Trip.countDocuments(query);
    const trips = await Trip.find(query)
      .populate('vehicle', 'name registrationNumber type status fuelType')
      .populate('driver', 'fullName phone safetyScore licenseNumber')
      .populate('student', 'name email phone studentId')
      .populate('ambulanceRequest')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.json({
      success: true,
      total,
      count: trips.length,
      trips,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single trip details
// @route   GET /api/trips/:id
// @access  Private
export const getTripById = async (req, res, next) => {
  try {
    const trip = await Trip.findById(req.params.id)
      .populate('vehicle')
      .populate('driver')
      .populate('student', 'name email phone studentId emergencyContact')
      .populate('ambulanceRequest');

    if (!trip) {
      return res.status(404).json({ success: false, message: 'Trip not found' });
    }

    // Role check for students
    if (req.user.role === 'student' && trip.student && trip.student._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Unauthorized access to this trip record' });
    }

    // Fetch related expenses and fuel logs
    const expenses = await Expense.find({ trip: trip._id });
    const fuelLogs = await FuelLog.find({ trip: trip._id });

    res.json({
      success: true,
      trip,
      financials: {
        expenses,
        fuelLogs,
        totalTripExpense: expenses.reduce((acc, curr) => acc + curr.amount, 0),
        totalFuelCost: fuelLogs.reduce((acc, curr) => acc + curr.totalCost, 0),
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a general fleet trip
// @route   POST /api/trips
// @access  Private (Fleet Manager, Dispatcher, Super Admin)
export const createTrip = async (req, res, next) => {
  try {
    const { vehicle: vehicleId, driver: driverId, source, destination, cargoWeight, plannedDistance, tripType } = req.body;

    const vehicle = await Vehicle.findById(vehicleId);
    if (!vehicle) return res.status(404).json({ success: false, message: 'Vehicle not found' });
    if (vehicle.status !== 'Available') {
      return res.status(400).json({
        success: false,
        message: `Vehicle ${vehicle.registrationNumber} is ${vehicle.status} and cannot be dispatched`,
      });
    }

    const driver = await Driver.findById(driverId);
    if (!driver) return res.status(404).json({ success: false, message: 'Driver not found' });
    if (driver.status !== 'Available') {
      return res.status(400).json({
        success: false,
        message: `Driver ${driver.fullName} is ${driver.status} and cannot be assigned`,
      });
    }

    // Cargo weight check
    if (cargoWeight && cargoWeight > vehicle.maxCapacity) {
      return res.status(400).json({
        success: false,
        message: `Cargo weight (${cargoWeight} kg) exceeds vehicle max capacity (${vehicle.maxCapacity} kg)`,
      });
    }

    const tripNumber = `TRP-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

    const trip = await Trip.create({
      tripNumber,
      tripType: tripType || 'General',
      vehicle: vehicle._id,
      driver: driver._id,
      source,
      destination,
      cargoWeight: cargoWeight || 0,
      plannedDistance: plannedDistance || 0,
      status: 'Dispatched',
      startTime: new Date(),
      estimatedCost: (plannedDistance || 10) * 22,
      timeline: [
        {
          status: 'Dispatched',
          note: 'Trip initiated and vehicle dispatched',
          updatedBy: req.user._id,
        },
      ],
    });

    // Mark vehicle & driver as On Trip
    vehicle.status = 'On Trip';
    await vehicle.save();

    driver.status = 'On Trip';
    await driver.save();

    res.status(201).json({
      success: true,
      message: 'Trip created and dispatched',
      trip,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update trip milestone / progress
// @route   POST /api/trips/:id/milestone
// @access  Private
export const updateTripMilestone = async (req, res, next) => {
  try {
    const { status, note, distanceIncrement, durationIncrement } = req.body;
    const trip = await Trip.findById(req.params.id);
    if (!trip) return res.status(404).json({ success: false, message: 'Trip not found' });

    trip.status = status;
    if (distanceIncrement) trip.actualDistance = (trip.actualDistance || 0) + Number(distanceIncrement);
    if (durationIncrement) trip.totalDuration = (trip.totalDuration || 0) + Number(durationIncrement);

    trip.timeline.push({
      status,
      timestamp: new Date(),
      note: note || `Trip milestone reached: ${status}`,
      updatedBy: req.user._id,
    });

    await trip.save();

    // If attached to an ambulance request, update request status too
    if (trip.ambulanceRequest) {
      await AmbulanceRequest.findByIdAndUpdate(trip.ambulanceRequest, { status });
    }

    res.json({
      success: true,
      message: `Trip status updated to ${status}`,
      trip,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Complete trip and automatically calculate final distance, duration, fuel and costs
// @route   POST /api/trips/:id/complete
// @access  Private
export const completeTrip = async (req, res, next) => {
  try {
    const { actualDistance, fuelConsumed, tolls, notes } = req.body;

    const trip = await Trip.findById(req.params.id);
    if (!trip) return res.status(404).json({ success: false, message: 'Trip not found' });

    if (trip.status === 'Completed') {
      return res.status(400).json({ success: false, message: 'Trip is already completed' });
    }

    const endTime = new Date();
    const startTime = trip.startTime || trip.createdAt;
    const diffMinutes = Math.max(1, Math.round((endTime - startTime) / (1000 * 60)));

    const finalDistance = actualDistance || trip.actualDistance || trip.plannedDistance || 15;
    const finalFuel = fuelConsumed || parseFloat((finalDistance / 10).toFixed(1)); // ~10 km/l average
    const fuelCost = finalFuel * 95; // Average fuel price INR 95/L

    // Auto-create toll expense if provided
    let otherExpenses = 0;
    if (tolls && Number(tolls) > 0) {
      await Expense.create({
        vehicle: trip.vehicle,
        trip: trip._id,
        category: 'Tolls',
        amount: Number(tolls),
        description: `Tolls for trip ${trip.tripNumber}`,
        recordedBy: req.user._id,
      });
      otherExpenses += Number(tolls);
    }

    // Auto-create fuel log for this trip
    await FuelLog.create({
      vehicle: trip.vehicle,
      trip: trip._id,
      fuelType: 'Diesel',
      liters: finalFuel,
      pricePerLiter: 95,
      totalCost: fuelCost,
      odometerReading: 25000 + finalDistance,
      fuelStation: 'Campus Transit Depot',
    });

    const driverAllowance = 150;
    const totalCost = fuelCost + otherExpenses + driverAllowance;

    trip.status = 'Completed';
    trip.endTime = endTime;
    trip.actualDistance = finalDistance;
    trip.totalDuration = diffMinutes;
    trip.fuelConsumed = finalFuel;
    trip.actualCost = totalCost;
    if (notes) trip.notes = notes;

    trip.timeline.push({
      status: 'Completed',
      timestamp: endTime,
      note: `Trip completed successfully. Total distance: ${finalDistance} km, Cost: INR ${totalCost}`,
      updatedBy: req.user._id,
    });

    await trip.save();

    // Restore Vehicle and Driver status to 'Available'
    const vehicle = await Vehicle.findById(trip.vehicle);
    if (vehicle && vehicle.status !== 'Retired' && vehicle.status !== 'In Shop') {
      vehicle.status = 'Available';
      vehicle.odometer = (vehicle.odometer || 0) + finalDistance;
      await vehicle.save();
    }

    const driver = await Driver.findById(trip.driver);
    if (driver && driver.status !== 'Suspended') {
      driver.status = 'Available';
      driver.totalTripsCompleted = (driver.totalTripsCompleted || 0) + 1;
      await driver.save();
    }

    // Update AmbulanceRequest if applicable
    if (trip.ambulanceRequest) {
      await AmbulanceRequest.findByIdAndUpdate(trip.ambulanceRequest, {
        status: 'Completed',
      });
    }

    res.json({
      success: true,
      message: 'Trip completed successfully. Vehicle and driver are now available.',
      trip,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Cancel trip
// @route   POST /api/trips/:id/cancel
// @access  Private (Dispatcher, Fleet Manager, Super Admin)
export const cancelTrip = async (req, res, next) => {
  try {
    const { reason } = req.body;
    const trip = await Trip.findById(req.params.id);
    if (!trip) return res.status(404).json({ success: false, message: 'Trip not found' });

    if (trip.status === 'Completed') {
      return res.status(400).json({ success: false, message: 'Cannot cancel an already completed trip' });
    }

    trip.status = 'Cancelled';
    trip.timeline.push({
      status: 'Cancelled',
      timestamp: new Date(),
      note: reason || 'Trip cancelled by coordinator',
      updatedBy: req.user._id,
    });
    await trip.save();

    // Restore vehicle and driver availability
    await Vehicle.findByIdAndUpdate(trip.vehicle, { status: 'Available' });
    await Driver.findByIdAndUpdate(trip.driver, { status: 'Available' });

    if (trip.ambulanceRequest) {
      await AmbulanceRequest.findByIdAndUpdate(trip.ambulanceRequest, {
        status: 'Cancelled',
        rejectionReason: reason || 'Trip cancelled',
      });
    }

    res.json({
      success: true,
      message: 'Trip cancelled. Vehicle and driver status restored to Available.',
      trip,
    });
  } catch (error) {
    next(error);
  }
};
