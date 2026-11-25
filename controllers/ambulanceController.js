import AmbulanceRequest from '../models/AmbulanceRequest.js';
import Vehicle from '../models/Vehicle.js';
import Driver from '../models/Driver.js';
import Trip from '../models/Trip.js';
import Notification from '../models/Notification.js';
import { calculateDistanceMeters } from '../utils/haversine.js';

// @desc    Submit a new ambulance booking request (Student)
// @route   POST /api/ambulance-requests
// @access  Private (Student, Super Admin, Dispatcher)
export const createAmbulanceRequest = async (req, res, next) => {
  try {
    const {
      studentName,
      studentId,
      contactNumber,
      emergencyContact,
      pickupLocation,
      destinationHospital,
      appointmentDate,
      appointmentTime,
      requestType,
      medicalNotes,
      returnRequired,
    } = req.body;

    // Validation
    if (!pickupLocation || !pickupLocation.address || !pickupLocation.lat || !pickupLocation.lng) {
      return res.status(400).json({
        success: false,
        message: 'Valid pickup location with latitude and longitude is required',
      });
    }

    if (!destinationHospital || !destinationHospital.name || !destinationHospital.lat || !destinationHospital.lng) {
      return res.status(400).json({
        success: false,
        message: 'Destination hospital with valid coordinates is required',
      });
    }

    const request = await AmbulanceRequest.create({
      student: req.user._id,
      studentName: studentName || req.user.name,
      studentId: studentId || req.user.studentId || 'NITJSR-STUDENT',
      contactNumber: contactNumber || req.user.phone || '9876543210',
      emergencyContact: emergencyContact || req.user.emergencyContact,
      pickupLocation,
      destinationHospital,
      appointmentDate: appointmentDate || new Date(),
      appointmentTime: appointmentTime || 'Immediate',
      requestType: requestType || 'Medical Appointment',
      medicalNotes,
      returnRequired: returnRequired !== undefined ? returnRequired : true,
      status: 'Pending',
    });

    // Create system notification for dispatchers and fleet managers
    await Notification.create({
      roleRecipient: 'dispatcher',
      title: `New Ambulance Request [${request.requestType}]`,
      message: `${request.studentName} requested ambulance transportation to ${request.destinationHospital.name}.`,
      type: request.requestType === 'Emergency' ? 'emergency' : 'info',
      link: `/ambulance/requests`,
    });

    res.status(201).json({
      success: true,
      message: 'Ambulance request submitted successfully. Awaiting dispatcher review.',
      request,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all ambulance requests (filtered by user role)
// @route   GET /api/ambulance-requests
// @access  Private
export const getAmbulanceRequests = async (req, res, next) => {
  try {
    const { status, requestType, page = 1, limit = 50 } = req.query;

    const query = {};

    // If logged in as student, only view their own requests
    if (req.user.role === 'student') {
      query.student = req.user._id;
    }

    if (status) query.status = status;
    if (requestType) query.requestType = requestType;

    const total = await AmbulanceRequest.countDocuments(query);
    const requests = await AmbulanceRequest.find(query)
      .populate('assignedAmbulance', 'name registrationNumber type status')
      .populate('assignedDriver', 'fullName phone safetyScore licenseNumber')
      .populate('trip', 'tripNumber status actualDistance actualCost')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.json({
      success: true,
      total,
      count: requests.length,
      requests,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single ambulance request by ID
// @route   GET /api/ambulance-requests/:id
// @access  Private
export const getAmbulanceRequestById = async (req, res, next) => {
  try {
    const request = await AmbulanceRequest.findById(req.params.id)
      .populate('student', 'name email phone studentId department')
      .populate('assignedAmbulance')
      .populate('assignedDriver')
      .populate('trip');

    if (!request) {
      return res.status(404).json({ success: false, message: 'Ambulance request not found' });
    }

    // Role check: Student can only view their own request
    if (req.user.role === 'student' && request.student._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Unauthorized access to this booking' });
    }

    res.json({
      success: true,
      request,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Approve ambulance request
// @route   POST /api/ambulance-requests/:id/approve
// @access  Private (Dispatcher, Fleet Manager, Super Admin)
export const approveAmbulanceRequest = async (req, res, next) => {
  try {
    const request = await AmbulanceRequest.findById(req.params.id);
    if (!request) {
      return res.status(404).json({ success: false, message: 'Ambulance request not found' });
    }

    if (request.status !== 'Pending') {
      return res.status(400).json({
        success: false,
        message: `Cannot approve request with current status: ${request.status}`,
      });
    }

    request.status = 'Approved';
    request.approvedBy = req.user._id;
    request.approvedAt = new Date();
    await request.save();

    // Notify the student
    await Notification.create({
      recipient: request.student,
      title: 'Ambulance Request Approved',
      message: `Your ambulance request to ${request.destinationHospital.name} has been approved. A vehicle will be assigned shortly.`,
      type: 'success',
      link: `/ambulance/requests/${request._id}`,
    });

    res.json({
      success: true,
      message: 'Request approved. Ready for vehicle & driver assignment.',
      request,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Assign ambulance & driver to request and dispatch trip
// @route   POST /api/ambulance-requests/:id/assign
// @access  Private (Dispatcher, Fleet Manager, Super Admin)
export const assignAmbulanceAndDriver = async (req, res, next) => {
  try {
    const { ambulanceId, driverId } = req.body;

    const request = await AmbulanceRequest.findById(req.params.id);
    if (!request) {
      return res.status(404).json({ success: false, message: 'Ambulance request not found' });
    }

    if (['Completed', 'Cancelled', 'Rejected'].includes(request.status)) {
      return res.status(400).json({
        success: false,
        message: `Cannot assign to an ambulance request that is ${request.status}`,
      });
    }

    // Verify Vehicle availability
    const vehicle = await Vehicle.findById(ambulanceId);
    if (!vehicle) {
      return res.status(404).json({ success: false, message: 'Ambulance vehicle not found' });
    }
    if (vehicle.status !== 'Available') {
      return res.status(400).json({
        success: false,
        message: `Ambulance ${vehicle.registrationNumber} is currently ${vehicle.status} and cannot be assigned.`,
      });
    }

    // Verify Driver availability and eligibility
    const driver = await Driver.findById(driverId);
    if (!driver) {
      return res.status(404).json({ success: false, message: 'Driver not found' });
    }
    if (driver.status !== 'Available') {
      return res.status(400).json({
        success: false,
        message: `Driver ${driver.fullName} is currently ${driver.status} and cannot be assigned.`,
      });
    }

    // Check Driver License validity
    if (new Date(driver.licenseExpiryDate) < new Date()) {
      return res.status(400).json({
        success: false,
        message: `Driver ${driver.fullName}'s license has expired. Assignment blocked by safety rule.`,
      });
    }

    // Calculate approximate road/straight line distance
    const distMeters = calculateDistanceMeters(
      request.pickupLocation.lat,
      request.pickupLocation.lng,
      request.destinationHospital.lat,
      request.destinationHospital.lng
    );
    const plannedKm = distMeters ? parseFloat((distMeters / 1000 * 1.2).toFixed(1)) : 10; // add 20% for road routing

    // Create a new Trip for this journey
    const tripNumber = `AMB-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

    const trip = await Trip.create({
      tripNumber,
      tripType: 'Ambulance',
      student: request.student,
      passenger: request.student,
      vehicle: vehicle._id,
      driver: driver._id,
      ambulanceRequest: request._id,
      source: request.pickupLocation,
      destination: {
        address: `${request.destinationHospital.name}, ${request.destinationHospital.address}`,
        lat: request.destinationHospital.lat,
        lng: request.destinationHospital.lng,
      },
      plannedDistance: plannedKm,
      startTime: new Date(),
      status: 'En Route',
      transportationCharge: 0, // Free campus medical service
      estimatedCost: parseFloat((plannedKm * 28).toFixed(2)), // standard ambulance operational cost factor
      timeline: [
        {
          status: 'Dispatched',
          note: `Ambulance ${vehicle.registrationNumber} assigned to driver ${driver.fullName}`,
          updatedBy: req.user._id,
        },
      ],
    });

    // Update Vehicle and Driver status to 'On Trip'
    vehicle.status = 'On Trip';
    await vehicle.save();

    driver.status = 'On Trip';
    await driver.save();

    // Update Ambulance Request
    request.assignedAmbulance = vehicle._id;
    request.assignedDriver = driver._id;
    request.trip = trip._id;
    request.status = 'Driver En Route';
    await request.save();

    // Create notifications for Student and Driver
    await Notification.create({
      recipient: request.student,
      title: 'Ambulance Dispatched!',
      message: `Ambulance ${vehicle.registrationNumber} (Driver: ${driver.fullName}, Phone: ${driver.phone}) is en route to your pickup point.`,
      type: 'info',
      link: `/tracking/${trip._id}`,
    });

    await Notification.create({
      recipient: driver.user || null,
      title: 'New Emergency Trip Assigned',
      message: `Pickup ${request.studentName} at ${request.pickupLocation.address} for ${request.destinationHospital.name}.`,
      type: 'emergency',
      link: `/tracking/${trip._id}`,
    });

    res.json({
      success: true,
      message: 'Ambulance and driver assigned successfully. Trip dispatched.',
      request,
      tripId: trip._id,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Reject ambulance request
// @route   POST /api/ambulance-requests/:id/reject
// @access  Private (Dispatcher, Fleet Manager)
export const rejectAmbulanceRequest = async (req, res, next) => {
  try {
    const { reason } = req.body;
    const request = await AmbulanceRequest.findById(req.params.id);

    if (!request) {
      return res.status(404).json({ success: false, message: 'Ambulance request not found' });
    }

    request.status = 'Rejected';
    request.rejectionReason = reason || 'Unable to fulfill request due to operational constraints.';
    await request.save();

    await Notification.create({
      recipient: request.student,
      title: 'Ambulance Request Rejected',
      message: `Your request was rejected. Reason: ${request.rejectionReason}`,
      type: 'danger',
    });

    res.json({
      success: true,
      message: 'Request rejected',
      request,
    });
  } catch (error) {
    next(error);
  }
};
