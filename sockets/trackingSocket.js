import { calculateDistanceMeters, getProximityStatus } from '../utils/haversine.js';
import LocationHistory from '../models/LocationHistory.js';
import Trip from '../models/Trip.js';

// In-memory active trip state cache for fast Socket.IO broadcast
const activeTripPositions = new Map();

/**
 * Socket.IO Real-time GPS & Tracking engine
 */
export const initTrackingSocket = (io) => {
  io.on('connection', (socket) => {
    console.log(`[Socket] Client connected: ${socket.id}`);

    // Join room for a specific trip
    socket.on('join:trip', (tripId) => {
      socket.join(`trip:${tripId}`);
      console.log(`[Socket] Client ${socket.id} joined room trip:${tripId}`);

      // Send latest known positions immediately if available
      if (activeTripPositions.has(tripId)) {
        socket.emit('tracking:state', activeTripPositions.get(tripId));
      }
    });

    // Leave trip room
    socket.on('leave:trip', (tripId) => {
      socket.leave(`trip:${tripId}`);
      console.log(`[Socket] Client ${socket.id} left room trip:${tripId}`);
    });

    /**
     * Driver emits live GPS location
     */
    socket.on('driver:location', async (data) => {
      const { tripId, coordinates, speed, heading, accuracy, isSimulated } = data;
      if (!tripId || !coordinates) return;

      let tripState = activeTripPositions.get(tripId) || {
        tripId,
        ambulance: null,
        student: null,
        distanceMeters: null,
        proximity: { status: 'Location Unavailable' },
      };

      tripState.ambulance = {
        coordinates,
        speed: speed || 0,
        heading: heading || 0,
        accuracy: accuracy || 10,
        timestamp: new Date(),
        isSimulated: !!isSimulated,
      };

      // Recalculate proximity if student location is known
      if (tripState.student?.coordinates) {
        const dist = calculateDistanceMeters(
          coordinates.lat,
          coordinates.lng,
          tripState.student.coordinates.lat,
          tripState.student.coordinates.lng
        );
        tripState.distanceMeters = dist;
        tripState.proximity = getProximityStatus(dist);
      }

      activeTripPositions.set(tripId, tripState);

      // Broadcast to all participants in this trip room
      io.to(`trip:${tripId}`).emit('tracking:state', tripState);

      // Async write to MongoDB location history
      try {
        await LocationHistory.create({
          trip: tripId,
          entityType: 'ambulance',
          coordinates,
          speed: speed || 0,
          heading: heading || 0,
          accuracy: accuracy || 10,
          isSimulated: !!isSimulated,
        });
      } catch (err) {
        console.error('[Socket] Failed to persist ambulance location:', err.message);
      }
    });

    /**
     * Student emits live GPS location (with explicit permission)
     */
    socket.on('student:location', async (data) => {
      const { tripId, coordinates, accuracy, isSimulated } = data;
      if (!tripId || !coordinates) return;

      let tripState = activeTripPositions.get(tripId) || {
        tripId,
        ambulance: null,
        student: null,
        distanceMeters: null,
        proximity: { status: 'Location Unavailable' },
      };

      tripState.student = {
        coordinates,
        accuracy: accuracy || 10,
        timestamp: new Date(),
        isSimulated: !!isSimulated,
      };

      // Recalculate proximity if ambulance location is known
      if (tripState.ambulance?.coordinates) {
        const dist = calculateDistanceMeters(
          tripState.ambulance.coordinates.lat,
          tripState.ambulance.coordinates.lng,
          coordinates.lat,
          coordinates.lng
        );
        tripState.distanceMeters = dist;
        tripState.proximity = getProximityStatus(dist);
      }

      activeTripPositions.set(tripId, tripState);

      // Broadcast to room
      io.to(`trip:${tripId}`).emit('tracking:state', tripState);

      // Async write to MongoDB
      try {
        await LocationHistory.create({
          trip: tripId,
          entityType: 'student',
          coordinates,
          accuracy: accuracy || 10,
          isSimulated: !!isSimulated,
        });
      } catch (err) {
        console.error('[Socket] Failed to persist student location:', err.message);
      }
    });

    /**
     * Simulation tick emitted from frontend simulation controller
     */
    socket.on('simulation:step', (data) => {
      const { tripId, ambulanceCoord, studentCoord, stepLabel, phase } = data;
      if (!tripId) return;

      const dist = calculateDistanceMeters(
        ambulanceCoord.lat,
        ambulanceCoord.lng,
        studentCoord.lat,
        studentCoord.lng
      );
      const proximity = getProximityStatus(dist);

      const tripState = {
        tripId,
        ambulance: {
          coordinates: ambulanceCoord,
          speed: 42,
          heading: 65,
          timestamp: new Date(),
          isSimulated: true,
          label: stepLabel,
        },
        student: {
          coordinates: studentCoord,
          timestamp: new Date(),
          isSimulated: true,
        },
        distanceMeters: dist,
        distanceKm: (dist / 1000).toFixed(2),
        proximity,
        phase: phase || 'Outbound',
      };

      activeTripPositions.set(tripId, tripState);
      io.to(`trip:${tripId}`).emit('tracking:state', tripState);
    });

    socket.on('disconnect', () => {
      console.log(`[Socket] Client disconnected: ${socket.id}`);
    });
  });
};
