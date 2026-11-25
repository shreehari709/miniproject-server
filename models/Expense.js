import mongoose from 'mongoose';

const expenseSchema = new mongoose.Schema(
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
    category: {
      type: String,
      enum: [
        'Fuel',
        'Maintenance',
        'Tolls',
        'Parking',
        'Driver Allowance',
        'Repairs',
        'Miscellaneous',
      ],
      required: [true, 'Expense category is required'],
    },
    amount: {
      type: Number,
      required: [true, 'Expense amount is required'],
      min: 0,
    },
    date: {
      type: Date,
      default: Date.now,
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
    },
    receiptUrl: {
      type: String,
      default: '',
    },
    isApproved: {
      type: Boolean,
      default: true,
    },
    recordedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  }
);

expenseSchema.index({ vehicle: 1, category: 1, date: -1 });

export default mongoose.model('Expense', expenseSchema);
