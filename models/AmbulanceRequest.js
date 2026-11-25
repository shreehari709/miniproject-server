import mongoose from 'mongoose';

const ambulanceRequestSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Student is required'],
    },
    studentName: {
      type: String,
      required: true,
    },
    studentId: {
      type: String,
      required: true,
    },
    contactNumber: {
      type: String,
      required: true,
    },
    emergencyContact: {
      name: String,
      relation: String,
      phone: String,
    },
    pickupLocation: {
      address: { type: String, required: true },
      lat: { type: Number, required: true },
      lng: { type: Number, required: true },
    },
    destinationHospital: {
      name: { type: String, required: true },
      address: { type: String, required: true },
      lat: { type: Number, required: true },
      lng: { type: Number, required: true },
    },
    appointmentDate: {
      type: Date,
      required: true,
    },
    appointmentTime: {
      type: String,
      required: true,
    },
    requestType: {
      type: String,
      enum: [
        'Emergency',
        'Routine Checkup',
        'Medical Appointment',
        'Follow-up Visit',
        'Other',
      ],
      default: 'Medical Appointment',
    },
    medicalNotes: {
      type: String,
      default: '',
    },
    status: {
      type: String,
      enum: [
        'Pending',
        'Approved',
        'Assigned',
        'Driver En Route',
        'Arrived at Pickup',
        'Student Picked Up',
        'Arrived at Hospital',
        'Waiting for Return',
        'Return Journey',
        'Completed',
        'Rejected',
        'Cancelled',
      ],
      default: 'Pending',
    },
    assignedAmbulance: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Vehicle',
    },
    assignedDriver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Driver',
    },
    trip: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Trip',
    },
    rejectionReason: {
      type: String,
      default: '',
    },
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    approvedAt: {
      type: Date,
    },
    returnRequired: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

ambulanceRequestSchema.index({ status: 1, student: 1, createdAt: -1 });

export default mongoose.model('AmbulanceRequest', ambulanceRequestSchema);
