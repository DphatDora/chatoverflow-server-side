const express = require('express');
const router = express.Router();
const notificationController = require('../../controller/notification/Notification.controller');
const authMiddleware = require('../../middleware/App.middleware');

// Get user notifications with pagination
router.get('/', authMiddleware, notificationController.getUserNotifications);

// Get unread notifications count
router.get(
  '/unread-count',
  authMiddleware,
  notificationController.getUnreadCount
);

// Mark notification as read
router.put(
  '/:notificationId/read',
  authMiddleware,
  notificationController.markAsRead
);

// Mark all notifications as read
router.put('/read-all', authMiddleware, notificationController.markAllAsRead);

module.exports = router;
