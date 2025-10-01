class NotificationRequest {
  constructor({ userId, action, payload }) {
    this.userId = userId;
    this.action = action; // 'new_answer', 'question_upvote', 'question_downvote', etc.
    this.payload = payload || {}; // Additional data as JSON object
  }

  validate() {
    const errors = [];

    if (!this.userId) {
      errors.push('userId is required');
    }

    if (!this.action) {
      errors.push('action is required');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  // Sanitize and prepare data
  sanitize() {
    return {
      userId: this.userId?.toString().trim(),
      action: this.action?.trim(),
      payload: this.payload || {},
    };
  }
}

module.exports = {
  NotificationRequest,
};
