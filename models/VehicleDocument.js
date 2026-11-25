import mongoose from 'mongoose';

const vehicleDocumentSchema = new mongoose.Schema(
  {
    vehicle: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Vehicle',
      required: true,
    },
    documentType: {
      type: String,
      enum: ['Insurance', 'Registration (RC)', 'Pollution (PUC)', 'Fitness', 'Permit', 'Tax Token'],
      required: true,
    },
    documentNumber: {
      type: String,
      required: true,
    },
    issueDate: {
      type: Date,
    },
    expiryDate: {
      type: Date,
      required: true,
    },
    issuingAuthority: {
      type: String,
      default: 'RTO Jamshedpur',
    },
    documentUrl: {
      type: String,
      default: '',
    },
    status: {
      type: String,
      enum: ['Valid', 'Expiring Soon', 'Expired'],
      default: 'Valid',
    },
  },
  {
    timestamps: true,
  }
);

vehicleDocumentSchema.index({ vehicle: 1, expiryDate: 1 });

export default mongoose.model('VehicleDocument', vehicleDocumentSchema);
