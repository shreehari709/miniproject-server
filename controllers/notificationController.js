import Notification from '../models/Notification.js';

// @desc    Get notifications for logged in user or role
// @route   GET /api/notifications
// @access  Private
export const getNotifications = async (req, res, next) => {
  try {
    const notifications = await Notification.find({
      $or: [
        { recipient: req.user._id },
        { roleRecipient: req.user.role },
        { roleRecipient: 'all' },
      ],
    })
      .sort({ createdAt: -1 })
      .limit(30);

    const unreadCount = notifications.filter((n) => !n.isRead).length;

    res.json({
      success: true,
      unreadCount,
      notifications,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Mark notification as read
// @route   PUT /api/notifications/:id/read
// @access  Private
export const markAsRead = async (req, res, next) => {
  try {
    await Notification.findByIdAndUpdate(req.params.id, { isRead: true });
    res.json({ success: true, message: 'Marked as read' });
  } catch (error) {
    next(error);
  }
};

// @desc    Mark all notifications as read
// @route   PUT /api/notifications/read-all
// @access  Private
export const markAllAsRead = async (req, res, next) => {
  try {
    await Notification.updateMany(
      {
        $or: [
          { recipient: req.user._id },
          { roleRecipient: req.user.role },
          { roleRecipient: 'all' },
        ],
        isRead: false,
      },
      { isRead: true }
    );
    res.json({ success: true, message: 'All notifications marked as read' });
  } catch (error) {
    next(error);
  }
};
