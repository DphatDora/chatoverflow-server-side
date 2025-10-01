const jwt = require('jsonwebtoken');

class SocketService {
  constructor() {
    this.io = null;
    this.connectedUsers = new Map(); // userId -> { socketId, connectTime, lastActivity }
  }

  // Initialize socket.io
  initialize(server) {
    const { Server } = require('socket.io');

    this.io = new Server(server, {
      cors: {
        origin: [
          'http://localhost:5173',
          'https://chatoverflow-client.vercel.app',
        ],
        methods: ['GET', 'POST'],
        credentials: true,
      },
    });

    this.setupEventHandlers();
    console.log('✅ Socket.io initialized');
  }

  setupEventHandlers() {
    this.io.on('connection', (socket) => {
      console.log(`🔌 New socket connection: ${socket.id}`);

      // Handle user authentication and login
      socket.on('user_login', async (data) => {
        try {
          const { token } = data;

          if (!token) {
            socket.emit('auth_error', { message: 'Token required' });
            return;
          }

          // Verify JWT token
          const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
          const userId = decoded.sub;

          // Store user connection
          this.addUserConnection(userId, socket.id);

          // Join user to their personal room for notifications
          socket.join(`user_${userId}`);

          // Store userId in socket for later use
          socket.userId = userId;

          socket.emit('auth_success', {
            message: 'Authenticated successfully',
            userId: userId,
          });

          // Broadcast user online status
          socket.broadcast.emit('user_online', { userId });

          console.log(`✅ User ${userId} authenticated and online`);
        } catch (error) {
          console.error('Socket authentication error:', error.message);
          socket.emit('auth_error', { message: 'Invalid token' });
        }
      });

      // Handle disconnection
      socket.on('disconnect', () => {
        if (socket.userId) {
          this.removeUserConnection(socket.userId);

          // Broadcast user offline status
          socket.broadcast.emit('user_offline', { userId: socket.userId });

          console.log(`👤 User ${socket.userId} disconnected`);
        }
        console.log(`🔌 Socket disconnected: ${socket.id}`);
      });

      // Handle manual logout
      socket.on('user_logout', () => {
        if (socket.userId) {
          this.removeUserConnection(socket.userId);
          socket.broadcast.emit('user_offline', { userId: socket.userId });
          console.log(`👋 User ${socket.userId} logged out`);
        }
        socket.disconnect();
      });

      // Keep alive for JWT expiration detection
      socket.on('ping', () => {
        if (socket.userId) {
          this.updateUserActivity(socket.userId);
        }
        socket.emit('pong');
      });

      // Handle JWT token expiration
      socket.on('token_expired', () => {
        if (socket.userId) {
          this.removeUserConnection(socket.userId);
          socket.broadcast.emit('user_offline', { userId: socket.userId });
          console.log(`⏰ User ${socket.userId} token expired`);
        }
        socket.disconnect();
      });
    });
  }

  // Add user connection
  addUserConnection(userId, socketId) {
    this.connectedUsers.set(userId, {
      socketId,
      connectTime: new Date(),
      lastActivity: new Date(),
    });
  }

  // Remove user connection
  removeUserConnection(userId) {
    this.connectedUsers.delete(userId);
  }

  // Update user last activity
  updateUserActivity(userId) {
    const userConnection = this.connectedUsers.get(userId);
    if (userConnection) {
      userConnection.lastActivity = new Date();
    }
  }

  // Check if user is online
  isUserOnline(userId) {
    return this.connectedUsers.has(userId);
  }

  // Get online users count
  getOnlineUsersCount() {
    return this.connectedUsers.size;
  }

  // Get all online user IDs
  getOnlineUsers() {
    return Array.from(this.connectedUsers.keys());
  }

  // Send notification to specific user
  sendNotificationToUser(userId, notification) {
    if (this.isUserOnline(userId) && this.io) {
      this.io.to(`user_${userId}`).emit('new_notification', notification);
      console.log(`📬 Notification sent to user ${userId} via socket`);
      return true;
    }
    return false;
  }

  // Send real-time notification
  async sendRealTimeNotification(userId, notificationData) {
    try {
      if (this.isUserOnline(userId)) {
        // Send via socket
        this.sendNotificationToUser(userId, notificationData);

        // Update notification record that it was sent via socket
        const NotificationService = require('./notification.service');
        if (notificationData.notificationId) {
          await NotificationService.markAsSentViaSocket(
            notificationData.notificationId
          );
        }

        return { success: true, method: 'socket' };
      } else {
        return { success: false, reason: 'user_offline' };
      }
    } catch (error) {
      console.error('Send real-time notification error:', error);
      return { success: false, error: error.message };
    }
  }

  // Broadcast to all online users
  broadcastToAll(event, data) {
    if (this.io) {
      this.io.emit(event, data);
    }
  }

  // Clean up inactive connections (run periodically)
  cleanupInactiveConnections() {
    const now = new Date();
    const inactiveThreshold = 30 * 60 * 1000; // 30 minutes

    for (const [userId, connection] of this.connectedUsers.entries()) {
      if (now - connection.lastActivity > inactiveThreshold) {
        console.log(`🧹 Cleaning up inactive connection for user ${userId}`);
        this.removeUserConnection(userId);

        // Optionally disconnect the socket
        if (this.io) {
          this.io.to(`user_${userId}`).emit('session_timeout');
          this.io.to(`user_${userId}`).disconnectSockets();
        }
      }
    }
  }
}

// Create singleton instance
const socketService = new SocketService();

// Cleanup inactive connections every 15 minutes
setInterval(() => {
  socketService.cleanupInactiveConnections();
}, 15 * 60 * 1000);

module.exports = socketService;
