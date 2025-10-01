const NotificationService = require('../../services/common/notification.service');
const ApiResponse = require('../../dto/res/api.response');
const {
  NewNotificationResponse,
} = require('../../dto/res/notification.response');
const { StatusCodes } = require('http-status-codes');

class NotificationController {
  // Get user notifications with pagination
  async getUserNotifications(req, res) {
    try {
      const userId = req.userId;
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;

      const result = await NotificationService.getUserNotifications(
        userId,
        page,
        limit
      );

      if (!result.success) {
        return res
          .status(StatusCodes.BAD_REQUEST)
          .json(ApiResponse.error(result.error));
      }

      const baseUrl = `${req.protocol}://${req.get('host')}${
        req.originalUrl.split('?')[0]
      }`;

      res.status(StatusCodes.OK).json(
        ApiResponse.withPagination(
          'Notifications retrieved successfully',
          result.notifications.map((n) => NewNotificationResponse(n)),
          result.pagination.currentPage,
          result.pagination.itemsPerPage,
          baseUrl,
          result.pagination.totalItems
        )
      );
    } catch (error) {
      console.error('Get user notifications error:', error);
      res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .json(ApiResponse.error('Failed to fetch notifications'));
    }
  }

  // Mark notification as read
  async markAsRead(req, res) {
    try {
      const userId = req.userId;
      const { notificationId } = req.params;

      const result = await NotificationService.markAsRead(
        notificationId,
        userId
      );

      if (!result.success) {
        return res
          .status(StatusCodes.BAD_REQUEST)
          .json(ApiResponse.error(result.error));
      }

      res
        .status(StatusCodes.OK)
        .json(
          ApiResponse.success(
            'Notification marked as read',
            NewNotificationResponse(result.notification)
          )
        );
    } catch (error) {
      console.error('Mark notification as read error:', error);
      res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .json(ApiResponse.error('Failed to mark notification as read'));
    }
  }

  // Get unread notifications count
  async getUnreadCount(req, res) {
    try {
      const userId = req.userId;

      const result = await NotificationService.getUnreadCount(userId);

      if (!result.success) {
        return res
          .status(StatusCodes.BAD_REQUEST)
          .json(ApiResponse.error(result.error));
      }

      res.status(StatusCodes.OK).json(
        ApiResponse.success('Unread count retrieved successfully', {
          count: result.count,
        })
      );
    } catch (error) {
      console.error('Get unread count error:', error);
      res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .json(ApiResponse.error('Failed to get unread count'));
    }
  }

  // Mark all notifications as read
  async markAllAsRead(req, res) {
    try {
      const userId = req.userId;

      const result = await NotificationService.markAllAsRead(userId);

      if (!result.success) {
        return res
          .status(StatusCodes.BAD_REQUEST)
          .json(ApiResponse.error(result.error));
      }

      res
        .status(StatusCodes.OK)
        .json(ApiResponse.success('All notifications marked as read'));
    } catch (error) {
      console.error('Mark all as read error:', error);
      res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .json(ApiResponse.error('Failed to mark all notifications as read'));
    }
  }
}

module.exports = new NotificationController();
