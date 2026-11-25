import mongoose from 'mongoose';

const maintenanceLogSchema = new mongoose.Schema(
  {
    vehicle: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Vehicle',
      required: [true, 'Vehicle is required'],
    },
    maintenanceType: {
      type: String,
      enum: [
        'Oil Change',
        'Brake Inspection',
        'Tire Replacement',
        'Engine Repair',
        'Electrical Repair',
        'Routine Service',
        'Suspension Work',
        'Other',
      ],
      required: [true, 'Maintenance type is required'],
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
    },
    reportedDate: {
      type: Date,
      default: Date.now,
    },
    serviceCenter: {
      type: String,
      required: [true, 'Service center name is required'],
      trim: true,
    },
    estimatedCost: {
      type: Number,
      default: 0,
      min: 0,
    },
    actualCost: {
      type: Number,
      default: 0,
      min: 0,
    },
    completionDate: {
      type: Date,
    },
    status: {
      type: String,
      enum: ['Scheduled', 'In Progress', 'Completed', 'Cancelled'],
      default: 'Scheduled',
    },
    invoiceNumber: {
      type: String,
      default: '',
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

maintenanceLogSchema.index({ vehicle: 1, status: 1 });

export default mongoose.model('MaintenanceLog', maintenanceLogSchema);
