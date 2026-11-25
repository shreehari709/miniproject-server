import mongoose from 'mongoose';

const tripSchema = new mongoose.Schema(
  {
    tripNumber: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
    },
    tripType: {
      type: String,
      enum: ['Ambulance', 'General'],
      default: 'General',
    },
    passenger: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    vehicle: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Vehicle',
      required: [true, 'Vehicle is required'],
    },
    driver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Driver',
      required: [true, 'Driver is required'],
    },
    ambulanceRequest: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'AmbulanceRequest',
    },
    source: {
      address: { type: String, required: true },
      lat: { type: Number, required: true },
      lng: { type: Number, required: true },
    },
    destination: {
      address: { type: String, required: true },
      lat: { type: Number, required: true },
      lng: { type: Number, required: true },
    },
    cargoWeight: {
      type: Number,
      default: 0,
    },
    plannedDistance: {
      type: Number,
      default: 0, // km
    },
    actualDistance: {
      type: Number,
      default: 0, // km
    },
    outboundDistance: {
      type: Number,
      default: 0,
    },
    returnDistance: {
      type: Number,
      default: 0,
    },
    outboundDuration: {
      type: Number,
      default: 0, // minutes
    },
    returnDuration: {
      type: Number,
      default: 0, // minutes
    },
    totalDuration: {
      type: Number,
      default: 0, // minutes
    },
    startTime: {
      type: Date,
    },
    endTime: {
      type: Date,
    },
    status: {
      type: String,
      enum: [
        'Draft',
        'Dispatched',
        'En Route',
        'Arrived Pickup',
        'In Transit',
        'Arrived Hospital',
        'Waiting Return',
        'Return En Route',
        'Completed',
        'Cancelled',
      ],
      default: 'Dispatched',
    },
    fuelConsumed: {
      type: Number,
      default: 0, // Liters
    },
    transportationCharge: {
      type: Number,
      default: 0, // In Rupees (e.g. subsidized for students)
    },
    estimatedCost: {
      type: Number,
      default: 0,
    },
    actualCost: {
      type: Number,
      default: 0,
    },
    // Verification fields
    pickupVerifiedByDriver: { type: Boolean, default: false },
    pickupVerifiedByStudent: { type: Boolean, default: false },
    pickupVerifiedAt: { type: Date },
    dropoffVerifiedByDriver: { type: Boolean, default: false },
    dropoffVerifiedByStudent: { type: Boolean, default: false },
    dropoffVerifiedAt: { type: Date },
    returnPickupVerifiedByDriver: { type: Boolean, default: false },
    returnPickupVerifiedByStudent: { type: Boolean, default: false },
    returnDropoffVerifiedByDriver: { type: Boolean, default: false },
    returnDropoffVerifiedByStudent: { type: Boolean, default: false },
    notes: { type: String, default: '' },
    timeline: [
      {
        status: { type: String, required: true },
        timestamp: { type: Date, default: Date.now },
        note: { type: String, default: '' },
        updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      },
    ],
  },
  {
    timestamps: true,
  }
);

tripSchema.index({ status: 1, vehicle: 1, driver: 1, createdAt: -1 });

export default mongoose.model('Trip', tripSchema);
