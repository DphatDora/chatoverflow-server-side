const Notification = require('../../models/Notification.model');
const User = require('../../models/User.model');
const nodemailer = require('nodemailer');
const {
  NewNotificationResponse,
} = require('../../dto/res/notification.response');
const {
  Worker,
  isMainThread,
  parentPort,
  workerData,
} = require('worker_threads');
const path = require('path');
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

// In-process background queue
class NotificationQueue {
  constructor() {
    this.queue = [];
    this.processing = false;
    this.workers = [];
    this.maxWorkers = 3;
    this.workerPool = [];

    // Initialize worker pool
    this.initializeWorkerPool();

    // Start processing queue
    this.startProcessing();
  }

  initializeWorkerPool() {
    for (let i = 0; i < this.maxWorkers; i++) {
      const worker = {
        id: i,
        busy: false,
        worker: null,
      };
      this.workerPool.push(worker);
    }
  }

  // Add notification to queue
  enqueue(notificationData) {
    this.queue.push({
      ...notificationData,
      addedAt: new Date(),
      retries: 0,
    });

    if (!this.processing) {
      this.startProcessing();
    }
  }

  // Get available worker
  getAvailableWorker() {
    return this.workerPool.find((w) => !w.busy);
  }

  // Process queue with worker pool
  async startProcessing() {
    if (this.processing) return;
    this.processing = true;

    while (this.queue.length > 0) {
      const availableWorker = this.getAvailableWorker();

      if (!availableWorker) {
        // Wait for a worker to become available
        await new Promise((resolve) => setTimeout(resolve, 100));
        continue;
      }

      const task = this.queue.shift();
      if (!task) continue;

      this.processWithWorker(availableWorker, task);
    }

    this.processing = false;
  }

  async processWithWorker(workerSlot, task) {
    workerSlot.busy = true;

    try {
      // Create worker for this task
      const worker = new Worker(__filename, {
        workerData: {
          task: task,
          isWorker: true,
        },
      });

      workerSlot.worker = worker;

      worker.on('message', (result) => {
        if (result.success) {
          console.log(`✅ Notification processed successfully: ${task.action}`);
        } else {
          console.error(`❌ Notification processing failed: ${result.error}`);

          // Retry logic
          if (task.retries < 3) {
            task.retries++;
            this.queue.push(task);
          }
        }

        // Free up worker
        workerSlot.busy = false;
        workerSlot.worker = null;
        worker.terminate();
      });

      worker.on('error', (error) => {
        console.error(`Worker error: ${error.message}`);
        workerSlot.busy = false;
        workerSlot.worker = null;

        // Retry on worker error
        if (task.retries < 3) {
          task.retries++;
          this.queue.push(task);
        }
      });
    } catch (error) {
      console.error(`Failed to create worker: ${error.message}`);
      workerSlot.busy = false;

      // Retry
      if (task.retries < 3) {
        task.retries++;
        this.queue.push(task);
      }
    }
  }
}

// Create global queue instance
const notificationQueue = new NotificationQueue();

// Worker thread logic
if (!isMainThread && workerData && workerData.isWorker) {
  const processNotificationInWorker = async (task) => {
    try {
      // Get user email
      const user = await User.findById(task.userId).select(
        'email name nickName'
      );
      if (!user || !user.email) {
        throw new Error('User not found or email not available');
      }

      // Create email transporter (reuse from OTP service pattern)
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      });

      // Generate email content based on action
      const emailContent = generateEmailContent(
        task.action,
        task.payload,
        user
      );

      // Send email
      await transporter.sendMail({
        from: `"ChatOverflow" <${process.env.EMAIL_USER}>`,
        to: user.email,
        subject: emailContent.subject,
        html: emailContent.html,
      });

      // Update notification record
      await Notification.findByIdAndUpdate(task.notificationId, {
        emailSent: true,
        emailSentAt: new Date(),
      });

      return { success: true };
    } catch (error) {
      // Update notification with error
      await Notification.findByIdAndUpdate(task.notificationId, {
        $set: {
          emailError: error.message,
          lastRetryAt: new Date(),
        },
        $inc: {
          retryCount: 1,
        },
      });

      return { success: false, error: error.message };
    }
  };

  // Process the task
  processNotificationInWorker(workerData.task)
    .then((result) => {
      parentPort.postMessage(result);
    })
    .catch((error) => {
      parentPort.postMessage({ success: false, error: error.message });
    });
}

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

// Main Notification Service
class NotificationService {
  // Create and queue notification
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

      // Try to send socket notification, but don't crash if it fails
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

      // Queue email processing (always send email regardless of online status)
      const emailTask = {
        notificationId: notification._id.toString(),
        userId: userIdString,
        action,
        payload,
        retryCount: 0,
      };

      notificationQueue.enqueue(emailTask);
      console.log(`📧 Email task queued for user: ${userIdString}`);

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
