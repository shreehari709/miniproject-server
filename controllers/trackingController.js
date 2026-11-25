import Trip from '../models/Trip.js';
import LocationHistory from '../models/LocationHistory.js';
import AmbulanceRequest from '../models/AmbulanceRequest.js';
import { calculateDistanceMeters, getProximityStatus } from '../utils/haversine.js';

// Coordinates path presets for NIT Jamshedpur to Tata Main Hospital (TMH) & return
export const DEMO_ROUTE_WAYPOINTS = [
  { name: 'NIT Jamshedpur Main Gate', lat: 22.7766, lng: 86.1444, step: 0 },
  { name: 'Adityapur Toll Bridge Approach', lat: 22.7830, lng: 86.1550, step: 1 },
  { name: 'Kharkai Bridge Crossing', lat: 22.7915, lng: 86.1680, step: 2 },
  { name: 'Bistupur Main Road', lat: 22.7980, lng: 86.1810, step: 3 },
  { name: 'Tata Main Hospital (TMH) Emergency', lat: 22.8042, lng: 86.1905, step: 4 },
  { name: 'Waiting Outside TMH OPD', lat: 22.8040, lng: 86.1910, step: 5 },
  { name: 'Return via Kadma Link Road', lat: 22.7900, lng: 86.1650, step: 6 },
  { name: 'Returned to NIT Jamshedpur Campus Health Centre', lat: 22.7766, lng: 86.1444, step: 7 },
];

// @desc    Record a single GPS location update (ambulance or student)
// @route   POST /api/tracking/location
// @access  Private
export const recordLocation = async (req, res, next) => {
  try {
    const { tripId, entityType, coordinates, speed, heading, accuracy, isSimulated } = req.body;

    if (!tripId || !entityType || !coordinates || !coordinates.lat || !coordinates.lng) {
      return res.status(400).json({
        success: false,
        message: 'tripId, entityType (ambulance/student), and valid coordinates are required',
      });
    }

    const trip = await Trip.findById(tripId);
    if (!trip) return res.status(404).json({ success: false, message: 'Trip not found' });

    // Save in LocationHistory
    const locationRecord = await LocationHistory.create({
      trip: tripId,
      entityType,
      coordinates,
      speed: speed || 0,
      heading: heading || 0,
      accuracy: accuracy || 10,
      timestamp: new Date(),
      isSimulated: isSimulated || false,
    });

    res.status(201).json({
      success: true,
      message: 'Location recorded successfully',
      location: locationRecord,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get latest tracking state for a trip (both ambulance and student locations + proximity)
// @route   GET /api/tracking/:tripId
// @access  Private
export const getTripTracking = async (req, res, next) => {
  try {
    const { tripId } = req.params;

    const trip = await Trip.findById(tripId)
      .populate('vehicle', 'name registrationNumber type')
      .populate('driver', 'fullName phone')
      .populate('student', 'name phone studentId')
      .populate('ambulanceRequest');

    if (!trip) return res.status(404).json({ success: false, message: 'Trip not found' });

    // Latest location for ambulance
    const latestAmbulance = await LocationHistory.findOne({
      trip: tripId,
      entityType: 'ambulance',
    }).sort({ timestamp: -1 });

    // Latest location for student
    const latestStudent = await LocationHistory.findOne({
      trip: tripId,
      entityType: 'student',
    }).sort({ timestamp: -1 });

    // Default fallback to source coordinates if no tracking pings yet
    const ambulanceCoord = latestAmbulance ? latestAmbulance.coordinates : trip.source;
    const studentCoord = latestStudent ? latestStudent.coordinates : trip.source;

    let distanceMeters = null;
    let proximity = { status: 'Location Unavailable', code: 'UNAVAILABLE' };

    if (ambulanceCoord && studentCoord) {
      distanceMeters = calculateDistanceMeters(
        ambulanceCoord.lat,
        ambulanceCoord.lng,
        studentCoord.lat,
        studentCoord.lng
      );
      proximity = getProximityStatus(distanceMeters);
    }

    res.json({
      success: true,
      trip,
      ambulance: {
        location: ambulanceCoord,
        speed: latestAmbulance ? latestAmbulance.speed : 0,
        heading: latestAmbulance ? latestAmbulance.heading : 0,
        lastUpdated: latestAmbulance ? latestAmbulance.timestamp : trip.startTime,
        isSimulated: latestAmbulance ? latestAmbulance.isSimulated : false,
      },
      student: {
        location: studentCoord,
        lastUpdated: latestStudent ? latestStudent.timestamp : trip.startTime,
        isSimulated: latestStudent ? latestStudent.isSimulated : false,
      },
      distanceMeters,
      distanceKm: distanceMeters !== null ? (distanceMeters / 1000).toFixed(2) : null,
      proximity,
      pickupPoint: trip.source,
      destinationPoint: trip.destination,
      status: trip.status,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get trip location history trail for map polyline rendering
// @route   GET /api/tracking/:tripId/history
// @access  Private
export const getTripHistory = async (req, res, next) => {
  try {
    const { tripId } = req.params;
    const history = await LocationHistory.find({ trip: tripId })
      .sort({ timestamp: 1 })
      .limit(500);

    res.json({
      success: true,
      count: history.length,
      history,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Verify Pickup (Driver or Student)
// @route   POST /api/tracking/:tripId/verify-pickup
// @access  Private
export const verifyPickup = async (req, res, next) => {
  try {
    const { tripId } = req.params;
    const { confirmedBy } = req.body; // 'driver' or 'student'

    const trip = await Trip.findById(tripId);
    if (!trip) return res.status(404).json({ success: false, message: 'Trip not found' });

    if (confirmedBy === 'driver') {
      trip.pickupVerifiedByDriver = true;
    } else if (confirmedBy === 'student') {
      trip.pickupVerifiedByStudent = true;
    } else {
      // Admin/Dispatcher override allows full confirmation
      trip.pickupVerifiedByDriver = true;
      trip.pickupVerifiedByStudent = true;
    }

    // Both parties confirmed
    if (trip.pickupVerifiedByDriver && trip.pickupVerifiedByStudent) {
      trip.pickupVerifiedAt = new Date();
      trip.status = 'In Transit';
      trip.timeline.push({
        status: 'In Transit',
        timestamp: new Date(),
        note: 'Pickup verified by both driver and student. En route to hospital.',
        updatedBy: req.user._id,
      });

      if (trip.ambulanceRequest) {
        await AmbulanceRequest.findByIdAndUpdate(trip.ambulanceRequest, {
          status: 'Student Picked Up',
        });
      }
    } else {
      trip.timeline.push({
        status: trip.status,
        timestamp: new Date(),
        note: `Pickup verified by ${confirmedBy}. Waiting for other party confirmation.`,
        updatedBy: req.user._id,
      });
    }

    await trip.save();

    res.json({
      success: true,
      message: `Pickup confirmed by ${confirmedBy || 'coordinator'}.`,
      bothVerified: trip.pickupVerifiedByDriver && trip.pickupVerifiedByStudent,
      trip,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Verify Dropoff / Hospital Arrival (Driver or Student)
// @route   POST /api/tracking/:tripId/verify-dropoff
// @access  Private
export const verifyDropoff = async (req, res, next) => {
  try {
    const { tripId } = req.params;
    const { confirmedBy, isReturnTrip } = req.body;

    const trip = await Trip.findById(tripId);
    if (!trip) return res.status(404).json({ success: false, message: 'Trip not found' });

    if (!isReturnTrip) {
      // Outbound Hospital Arrival
      if (confirmedBy === 'driver') trip.dropoffVerifiedByDriver = true;
      else if (confirmedBy === 'student') trip.dropoffVerifiedByStudent = true;
      else {
        trip.dropoffVerifiedByDriver = true;
        trip.dropoffVerifiedByStudent = true;
      }

      if (trip.dropoffVerifiedByDriver && trip.dropoffVerifiedByStudent) {
        trip.dropoffVerifiedAt = new Date();
        trip.status = 'Waiting Return';
        trip.timeline.push({
          status: 'Waiting Return',
          timestamp: new Date(),
          note: 'Hospital arrival verified. Ambulance waiting for patient medical consultation.',
          updatedBy: req.user._id,
        });

        if (trip.ambulanceRequest) {
          await AmbulanceRequest.findByIdAndUpdate(trip.ambulanceRequest, {
            status: 'Waiting for Return',
          });
        }
      }
    } else {
      // Return Dropoff at Campus
      if (confirmedBy === 'driver') trip.returnDropoffVerifiedByDriver = true;
      else if (confirmedBy === 'student') trip.returnDropoffVerifiedByStudent = true;
      else {
        trip.returnDropoffVerifiedByDriver = true;
        trip.returnDropoffVerifiedByStudent = true;
      }

      if (trip.returnDropoffVerifiedByDriver && trip.returnDropoffVerifiedByStudent) {
        trip.status = 'Completed';
        trip.endTime = new Date();
        trip.timeline.push({
          status: 'Completed',
          timestamp: new Date(),
          note: 'Student safely returned to campus. Round trip concluded.',
          updatedBy: req.user._id,
        });
      }
    }

    await trip.save();

    res.json({
      success: true,
      message: 'Dropoff / arrival confirmed successfully.',
      trip,
    });
  } catch (error) {
    next(error);
  }
};
