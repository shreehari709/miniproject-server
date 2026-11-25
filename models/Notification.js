import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema(
  {
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    roleRecipient: {
      type: String,
      enum: [
        'all',
        'super_admin',
        'fleet_manager',
        'dispatcher',
        'driver',
        'student',
        'safety_officer',
        'financial_analyst',
      ],
    },
    title: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ['info', 'warning', 'success', 'danger', 'emergency'],
      default: 'info',
    },
    link: {
      type: String,
      default: '',
    },
    isRead: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

notificationSchema.index({ recipient: 1, roleRecipient: 1, createdAt: -1 });

export default mongoose.model('Notification', notificationSchema);
