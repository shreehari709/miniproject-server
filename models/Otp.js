import mongoose from 'mongoose';

const otpSchema = new mongoose.Schema(
  {
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      index: true,
      trim: true,
    },
    otp: {
      type: String,
      required: [true, 'OTP code is required'],
    },
    expiresAt: {
      type: Date,
      required: true,
      index: { expires: 0 }, // MongoDB TTL index: document automatically expires after this timestamp
    },
    attempts: {
      type: Number,
      default: 0,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model('Otp', otpSchema);
