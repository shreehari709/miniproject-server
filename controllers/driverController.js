import Driver from '../models/Driver.js';
import Trip from '../models/Trip.js';

// @desc    Get all drivers with filters, search, sort
// @route   GET /api/drivers
// @access  Private
export const getDrivers = async (req, res, next) => {
  try {
    const { status, licenseCategory, search, sort } = req.query;

    const query = {};
    if (status) query.status = status;
    if (licenseCategory) query.licenseCategory = licenseCategory;

    if (search) {
      query.$or = [
        { fullName: { $regex: search, $options: 'i' } },
        { licenseNumber: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    let sortOption = { fullName: 1 };
    if (sort === 'score_desc') sortOption = { safetyScore: -1 };
    if (sort === 'expiry_asc') sortOption = { licenseExpiryDate: 1 };

    const drivers = await Driver.find(query)
      .populate('assignedVehicle', 'name registrationNumber type')
      .sort(sortOption);

    // Add virtual flag if license is expired or expiring in < 30 days
    const now = new Date();
    const enrichedDrivers = drivers.map((d) => {
      const expiry = new Date(d.licenseExpiryDate);
      const isExpired = expiry < now;
      const daysUntilExpiry = Math.ceil((expiry - now) / (1000 * 60 * 60 * 24));
      const isExpiringSoon = !isExpired && daysUntilExpiry <= 30;

      return {
        ...d.toObject(),
        isLicenseExpired: isExpired,
        isExpiringSoon,
        daysUntilExpiry,
      };
    });

    res.json({
      success: true,
      count: enrichedDrivers.length,
      drivers: enrichedDrivers,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get assignable drivers (Available, NOT Suspended, Valid License)
// @route   GET /api/drivers/available
// @access  Private
export const getAvailableDrivers = async (req, res, next) => {
  try {
    const now = new Date();
    const drivers = await Driver.find({
      status: 'Available',
      licenseExpiryDate: { $gt: now }, // License must not be expired
    }).populate('assignedVehicle', 'name registrationNumber type');

    res.json({
      success: true,
      drivers,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get driver by ID + trip history
// @route   GET /api/drivers/:id
// @access  Private
export const getDriverById = async (req, res, next) => {
  try {
    const driver = await Driver.findById(req.params.id).populate('assignedVehicle');
    if (!driver) {
      return res.status(404).json({ success: false, message: 'Driver not found' });
    }

    const trips = await Trip.find({ driver: driver._id })
      .sort({ createdAt: -1 })
      .limit(10)
      .populate('vehicle', 'name registrationNumber');

    res.json({
      success: true,
      driver,
      trips,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new driver
// @route   POST /api/drivers
// @access  Private (Admin, Fleet Manager)
export const createDriver = async (req, res, next) => {
  try {
    const { licenseNumber, email } = req.body;

    const exists = await Driver.findOne({
      licenseNumber: licenseNumber.toUpperCase().trim(),
    });
    if (exists) {
      return res.status(400).json({
        success: false,
        message: 'A driver with this license number already exists',
      });
    }

    const driver = await Driver.create(req.body);

    res.status(201).json({
      success: true,
      message: 'Driver profile created successfully',
      driver,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update driver
// @route   PUT /api/drivers/:id
// @access  Private (Admin, Fleet Manager, Safety Officer)
export const updateDriver = async (req, res, next) => {
  try {
    let driver = await Driver.findById(req.params.id);
    if (!driver) {
      return res.status(404).json({ success: false, message: 'Driver not found' });
    }

    driver = await Driver.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.json({
      success: true,
      message: 'Driver updated successfully',
      driver,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete driver
// @route   DELETE /api/drivers/:id
// @access  Private (Super Admin)
export const deleteDriver = async (req, res, next) => {
  try {
    const driver = await Driver.findById(req.params.id);
    if (!driver) {
      return res.status(404).json({ success: false, message: 'Driver not found' });
    }

    if (driver.status === 'On Trip') {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete a driver currently on an active trip.',
      });
    }

    await Driver.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Driver profile deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};
