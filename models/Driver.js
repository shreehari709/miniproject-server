import mongoose from 'mongoose';

const driverSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    fullName: {
      type: String,
      required: [true, 'Full name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      lowercase: true,
      trim: true,
    },
    phone: {
      type: String,
      required: [true, 'Contact number is required'],
      trim: true,
    },
    licenseNumber: {
      type: String,
      required: [true, 'License number is required'],
      unique: true,
      uppercase: true,
      trim: true,
    },
    licenseCategory: {
      type: String,
      enum: [
        'Heavy Commercial',
        'Medium Transport',
        'Light Motor Vehicle',
        'Emergency Vehicle',
      ],
      default: 'Emergency Vehicle',
    },
    licenseExpiryDate: {
      type: Date,
      required: [true, 'License expiry date is required'],
    },
    joiningDate: {
      type: Date,
      default: Date.now,
    },
    profileImage: {
      type: String,
      default: '',
    },
    safetyScore: {
      type: Number,
      default: 95,
      min: 0,
      max: 100,
    },
    emergencyContact: {
      name: String,
      relation: String,
      phone: String,
    },
    assignedVehicle: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Vehicle',
    },
    status: {
      type: String,
      enum: ['Available', 'On Trip', 'Off Duty', 'Suspended'],
      default: 'Available',
    },
    totalTripsCompleted: {
      type: Number,
      default: 0,
    },
    rating: {
      type: Number,
      default: 4.8,
      min: 1,
      max: 5,
    },
  },
  {
    timestamps: true,
  }
);

driverSchema.index({ status: 1, licenseExpiryDate: 1 });

export default mongoose.model('Driver', driverSchema);
