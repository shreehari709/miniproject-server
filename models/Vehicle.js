import mongoose from 'mongoose';

const vehicleSchema = new mongoose.Schema(
  {
    registrationNumber: {
      type: String,
      required: [true, 'Registration number is required'],
      unique: true,
      uppercase: true,
      trim: true,
    },
    name: {
      type: String,
      required: [true, 'Vehicle name/model is required'],
      trim: true,
    },
    manufacturer: {
      type: String,
      required: [true, 'Manufacturer is required'],
      trim: true,
    },
    type: {
      type: String,
      required: [true, 'Vehicle type is required'],
      enum: ['Ambulance', 'Car', 'Bus', 'Truck', 'Van', 'Other'],
      default: 'Other',
    },
    maxCapacity: {
      type: Number,
      required: [true, 'Max capacity is required'],
      min: 1,
    },
    odometer: {
      type: Number,
      default: 0,
      min: 0,
    },
    acquisitionCost: {
      type: Number,
      default: 0,
      min: 0,
    },
    purchaseDate: {
      type: Date,
      default: Date.now,
    },
    insuranceExpiry: {
      type: Date,
      required: [true, 'Insurance expiry date is required'],
    },
    registrationExpiry: {
      type: Date,
      required: [true, 'Registration expiry date is required'],
    },
    fuelType: {
      type: String,
      enum: ['Diesel', 'Petrol', 'CNG', 'Electric'],
      default: 'Diesel',
    },
    region: {
      type: String,
      default: 'Campus Central',
    },
    currentLocation: {
      address: { type: String, default: 'NIT Jamshedpur Campus' },
      lat: { type: Number, default: 22.7766 },
      lng: { type: Number, default: 86.1444 },
    },
    image: {
      type: String,
      default: '',
    },
    status: {
      type: String,
      enum: ['Available', 'On Trip', 'In Shop', 'Retired'],
      default: 'Available',
    },
    notes: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

vehicleSchema.index({ status: 1, type: 1 });

export default mongoose.model('Vehicle', vehicleSchema);
