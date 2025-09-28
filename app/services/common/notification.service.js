const Notification = require('../../models/Notification.model');
const User = require('../../models/User.model');
const nodemailer = require('nodemailer');
const {
  NewNotificationResponse,
} = require('../../dto/res/notification.response');
const mongoose = require('mongoose');

// Lazy import socket service to avoid circular dependency
let socketService = null;
const getSocketService = () => {
  if (!socketService) {
    try {
      socketService = require('./socket.service');
    } catch (error) {
      console.error('❌ Error importing socket service:', error.message);
      return null;
    }
  }
  return socketService;
};

// Create email transporter
const createEmailTransporter = () => {
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
};

// Generate email content based on action type
function generateEmailContent(action, payload, user) {
  const userName = user.name || user.nickName || 'bạn';

  const templates = {
    new_answer: {
      subject: 'Có câu trả lời mới cho câu hỏi của bạn',
      html: `
        <h3>Xin chào ${userName}!</h3>
        <p>Có người vừa trả lời câu hỏi "<strong>${payload.questionTitle}</strong>" của bạn.</p>
        <blockquote style="background: #f8f9fa; padding: 15px; border-left: 4px solid #007bff; margin: 15px 0;">
          ${payload.answerContent}
        </blockquote>
        <p>Bạn có thể xem chi tiết tại: <a href="${payload.questionUrl}">Xem câu trả lời</a></p>
        <p><small>Đây là email tự động, vui lòng không trả lời.</small></p>
      `,
    },
    question_upvote: {
      subject: 'Câu hỏi của bạn nhận được upvote',
      html: `
        <h3>Xin chào ${userName}!</h3>
        <p>Câu hỏi "<strong>${payload.questionTitle}</strong>" của bạn vừa nhận được một upvote! 👍</p>
        <p>Tổng số upvotes hiện tại: <strong>${payload.totalUpvotes}</strong></p>
        <p><a href="${payload.questionUrl}">Xem câu hỏi</a></p>
        <p><small>Đây là email tự động, vui lòng không trả lời.</small></p>
      `,
    },
    answer_upvote: {
      subject: 'Câu trả lời của bạn nhận được upvote',
      html: `
        <h3>Xin chào ${userName}!</h3>
        <p>Câu trả lời của bạn cho câu hỏi "<strong>${payload.questionTitle}</strong>" vừa nhận được một upvote! 👍</p>
        <p>Tổng số upvotes hiện tại: <strong>${payload.totalUpvotes}</strong></p>
        <p><a href="${payload.answerUrl}">Xem câu trả lời</a></p>
        <p><small>Đây là email tự động, vui lòng không trả lời.</small></p>
      `,
    },
  };

  return (
    templates[action] || {
      subject: 'Thông báo từ ChatOverflow',
      html: `
      <h3>Xin chào ${userName}!</h3>
      <p>Bạn có thông báo mới từ ChatOverflow.</p>
      <p><small>Đây là email tự động, vui lòng không trả lời.</small></p>
    `,
    }
  );
}

// Background email processing function
async function processEmailNotification(
  notificationId,
  userId,
  action,
  payload
) {
  try {
    console.log(
      `📧 Processing email notification for user: ${userId}, action: ${action}`
    );

    // Get user email
    const user = await User.findById(userId).select('email name nickName');
    if (!user || !user.email) {
      console.warn(
        `⚠️ User not found or email not available for userId: ${userId}`
      );
      return;
    }

    // Create email transporter
    const transporter = createEmailTransporter();

    // Generate email content
    const emailContent = generateEmailContent(action, payload, user);

    // Send email
    await transporter.sendMail({
      from: `"ChatOverflow" <${process.env.EMAIL_USER}>`,
      to: user.email,
      subject: emailContent.subject,
      html: emailContent.html,
    });

    // Update notification record
    await Notification.findByIdAndUpdate(notificationId, {
      emailSent: true,
      emailSentAt: new Date(),
    });

    console.log(
      `✅ Email sent successfully to ${user.email} for action: ${action}`
    );
  } catch (error) {
    console.error(
      `❌ Email processing failed for user ${userId}, action: ${action}:`,
      error.message
    );

    // Update notification with error (don't throw)
    try {
      await Notification.findByIdAndUpdate(notificationId, {
        $set: {
          emailError: error.message,
          lastRetryAt: new Date(),
        },
        $inc: {
          retryCount: 1,
        },
      });
    } catch (updateError) {
      console.error(
        `❌ Failed to update notification error status:`,
        updateError.message
      );
    }
  }
}

// Helper function to create notification response
function createNotificationResponse(notification) {
  return new NewNotificationResponse(notification);
}

// Main Notification Service
class NotificationService {
  // Create and process notification
  static async createNotification(userId, action, payload = {}) {
    try {
      // FIX: Ensure userId is a valid ObjectId string
      let userIdString;
      if (mongoose.Types.ObjectId.isValid(userId)) {
        userIdString = userId.toString();
      } else {
        throw new Error(`Invalid userId: ${userId}`);
      }

      console.log(
        `📝 Creating notification for user: ${userIdString}, action: ${action}`
      );

      // Create notification record
      const notification = new Notification({
        userId: userIdString,
        action,
        payload,
        isRead: false,
        emailSent: false,
        sentViaSocket: false,
      });

      await notification.save();
      console.log(`✅ Notification saved to database: ${notification._id}`);

      // Try to send socket notification (non-blocking)
      try {
        const socket = getSocketService();
        if (socket && socket.isUserOnline(userIdString)) {
          const notificationResponse = createNotificationResponse(notification);
          socket.sendNotificationToUser(userIdString, notificationResponse);

          // Update socket sent status
          notification.sentViaSocket = true;
          await notification.save();
          console.log(
            `📲 Notification sent via socket to user: ${userIdString}`
          );
        } else {
          console.log(
            `📱 User ${userIdString} is offline or socket service unavailable`
          );
        }
      } catch (socketError) {
        console.error(
          `❌ Socket notification failed for user ${userIdString}:`,
          socketError.message
        );
        // Continue processing email notification even if socket fails
      }

      // Process email notification in background (non-blocking)
      setImmediate(() => {
        processEmailNotification(
          notification._id.toString(),
          userIdString,
          action,
          payload
        );
      });

      return notification;
    } catch (error) {
      console.error('❌ Error creating notification:', error);
      throw error;
    }
  }

  // Mark as sent via socket
  static async markAsSentViaSocket(notificationId) {
    try {
      await Notification.findByIdAndUpdate(notificationId, {
        sentViaSocket: true,
        sentViaSocketAt: new Date(),
      });
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Send real-time notification via socket (will be implemented)
  static async sendSocketNotification(userId, notification) {
    // This will be implemented when we add socket.io
    // For now, just mark as sent via socket
    try {
      await Notification.findByIdAndUpdate(notification._id, {
        sentViaSocket: true,
        sentViaSocketAt: new Date(),
      });

      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Get user notifications with pagination
  static async getUserNotifications(userId, page = 1, limit = 10) {
    try {
      const skip = (page - 1) * limit;

      const notifications = await Notification.find({ userId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('userId', 'name nickName email');

      const total = await Notification.countDocuments({ userId });

      return {
        success: true,
        notifications,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(total / limit),
          totalItems: total,
          itemsPerPage: limit,
          hasNextPage: page < Math.ceil(total / limit),
          hasPrevPage: page > 1,
        },
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  // Mark notification as read
  static async markAsRead(notificationId, userId) {
    try {
      const notification = await Notification.findOneAndUpdate(
        { _id: notificationId, userId },
        { isRead: true, readAt: new Date() },
        { new: true }
      );

      if (!notification) {
        return { success: false, error: 'Notification not found' };
      }

      return { success: true, notification };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Get unread count
  static async getUnreadCount(userId) {
    try {
      const count = await Notification.countDocuments({
        userId,
        isRead: false,
      });

      return { success: true, count };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Mark all notifications as read
  static async markAllAsRead(userId) {
    try {
      await Notification.updateMany(
        { userId, isRead: false },
        { isRead: true, readAt: new Date() }
      );

      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
}

module.exports = NotificationService;
