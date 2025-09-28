const mongoose = require('mongoose');

const NotificationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    action: {
      type: String,
      required: true,
      enum: [
        'new_answer',
        'question_upvote',
        'question_downvote',
        'answer_upvote',
        'answer_downvote',
        'new_comment',
        'blog_upvote',
        'blog_downvote',
        'comment_upvote',
        'comment_downvote',
        'new_blog_comment',
        'blog_comment_upvote',
      ],
    },
    payload: {
      type: mongoose.Schema.Types.Mixed, // Flexible JSON object
      default: {},
    },

    // Tracking delivery status
    emailSent: { type: Boolean, default: false },
    emailSentAt: { type: Date },
    emailError: { type: String },

    sentViaSocket: { type: Boolean, default: false },
    sentViaSocketAt: { type: Date },

    // Read status
    isRead: { type: Boolean, default: false },
    readAt: { type: Date },

    // For retry mechanism
    retryCount: { type: Number, default: 0 },
    lastRetryAt: { type: Date },
  },
  {
    timestamps: true,
    // Index để tối ưu query
    index: [
      { userId: 1, createdAt: -1 },
      { emailSent: 1, createdAt: 1 }, // For background queue processing
      { action: 1 },
      { isRead: 1 },
    ],
  }
);

// Index cho performance
NotificationSchema.index({ userId: 1, isRead: 1, createdAt: -1 });
NotificationSchema.index({ emailSent: false, retryCount: { $lt: 3 } }); // For background processing

module.exports = mongoose.model('Notification', NotificationSchema);
