import mongoose from 'mongoose';

const locationHistorySchema = new mongoose.Schema(
  {
    trip: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Trip',
      required: true,
      index: true,
    },
    entityType: {
      type: String,
      enum: ['ambulance', 'student'],
      required: true,
    },
    coordinates: {
      lat: { type: Number, required: true },
      lng: { type: Number, required: true },
    },
    speed: {
      type: Number,
      default: 0,
    },
    heading: {
      type: Number,
      default: 0,
    },
    accuracy: {
      type: Number,
      default: 10,
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
    isSimulated: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

locationHistorySchema.index({ trip: 1, timestamp: -1 });

export default mongoose.model('LocationHistory', locationHistorySchema);
