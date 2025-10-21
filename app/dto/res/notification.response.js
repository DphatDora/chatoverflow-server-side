class NotificationResponse {
  constructor({
    id,
    userId,
    action,
    payload,
    emailSent,
    sentViaSocket,
    isRead,
    createdAt,
    updatedAt,
  }) {
    this.id = id;
    this.userId = userId;
    this.action = action;
    this.payload = payload;
    this.emailSent = emailSent;
    this.sentViaSocket = sentViaSocket;
    this.isRead = isRead;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }
}

const NewNotificationResponse = (notification) =>
  new NotificationResponse({
    id: notification._id,
    userId: notification.userId,
    action: notification.action,
    payload: notification.payload,
    emailSent: notification.emailSent,
    sentViaSocket: notification.sentViaSocket,
    isRead: notification.isRead,
    createdAt: notification.createdAt,
    updatedAt: notification.updatedAt,
  });

module.exports = {
  NotificationResponse,
  NewNotificationResponse,
};
