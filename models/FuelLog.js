import mongoose from 'mongoose';

const fuelLogSchema = new mongoose.Schema(
  {
    vehicle: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Vehicle',
      required: [true, 'Vehicle is required'],
    },
    trip: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Trip',
    },
    fuelType: {
      type: String,
      enum: ['Diesel', 'Petrol', 'CNG', 'Electric'],
      default: 'Diesel',
    },
    liters: {
      type: Number,
      required: [true, 'Liters consumed/purchased is required'],
      min: 0.1,
    },
    pricePerLiter: {
      type: Number,
      required: [true, 'Price per liter is required'],
      min: 0,
    },
    totalCost: {
      type: Number,
      required: true,
      min: 0,
    },
    date: {
      type: Date,
      default: Date.now,
    },
    odometerReading: {
      type: Number,
      required: [true, 'Odometer reading is required'],
      min: 0,
    },
    fuelStation: {
      type: String,
      default: 'NIT Jamshedpur Campus Fuel Station',
    },
    receiptNumber: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

fuelLogSchema.index({ vehicle: 1, date: -1 });

export default mongoose.model('FuelLog', fuelLogSchema);
