import MaintenanceLog from '../models/MaintenanceLog.js';
import Vehicle from '../models/Vehicle.js';

// @desc    Get all maintenance records
// @route   GET /api/maintenance
// @access  Private
export const getMaintenanceLogs = async (req, res, next) => {
  try {
    const { status, maintenanceType, vehicleId } = req.query;

    const query = {};
    if (status) query.status = status;
    if (maintenanceType) query.maintenanceType = maintenanceType;
    if (vehicleId) query.vehicle = vehicleId;

    const logs = await MaintenanceLog.find(query)
      .populate('vehicle', 'name registrationNumber type status')
      .sort({ reportedDate: -1 });

    res.json({
      success: true,
      count: logs.length,
      logs,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new maintenance record (Automated: puts vehicle 'In Shop')
// @route   POST /api/maintenance
// @access  Private (Fleet Manager, Super Admin)
export const createMaintenanceLog = async (req, res, next) => {
  try {
    const { vehicle: vehicleId, maintenanceType, description, serviceCenter, estimatedCost, status } = req.body;

    const vehicle = await Vehicle.findById(vehicleId);
    if (!vehicle) return res.status(404).json({ success: false, message: 'Vehicle not found' });

    if (vehicle.status === 'On Trip') {
      return res.status(400).json({
        success: false,
        message: 'Cannot schedule maintenance for a vehicle currently On Trip.',
      });
    }

    const log = await MaintenanceLog.create(req.body);

    // Business Rule: Creating active maintenance automatically changes vehicle status to 'In Shop'
    if (log.status !== 'Completed' && log.status !== 'Cancelled') {
      vehicle.status = 'In Shop';
      await vehicle.save();
    }

    res.status(201).json({
      success: true,
      message: 'Maintenance scheduled. Vehicle marked as In Shop.',
      log,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update maintenance log
// @route   PUT /api/maintenance/:id
// @access  Private (Fleet Manager, Super Admin)
export const updateMaintenanceLog = async (req, res, next) => {
  try {
    let log = await MaintenanceLog.findById(req.params.id);
    if (!log) return res.status(404).json({ success: false, message: 'Maintenance record not found' });

    log = await MaintenanceLog.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.json({
      success: true,
      message: 'Maintenance record updated',
      log,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Close maintenance log (Automated: restores vehicle status to 'Available')
// @route   POST /api/maintenance/:id/close
// @access  Private (Fleet Manager, Super Admin)
export const closeMaintenanceLog = async (req, res, next) => {
  try {
    const { actualCost, completionDate, notes } = req.body;

    const log = await MaintenanceLog.findById(req.params.id);
    if (!log) return res.status(404).json({ success: false, message: 'Maintenance record not found' });

    log.status = 'Completed';
    log.actualCost = actualCost !== undefined ? Number(actualCost) : log.estimatedCost;
    log.completionDate = completionDate || new Date();
    if (notes) log.notes = notes;
    await log.save();

    // Business Rule: Restores vehicle status to Available unless vehicle is Retired
    const vehicle = await Vehicle.findById(log.vehicle);
    if (vehicle && vehicle.status !== 'Retired') {
      vehicle.status = 'Available';
      await vehicle.save();
    }

    res.json({
      success: true,
      message: 'Maintenance completed. Vehicle status restored to Available.',
      log,
    });
  } catch (error) {
    next(error);
  }
};
