class ReplyRequest {
  constructor(content, answerId, parentId) {
    this.content = content;
    this.answerId = answerId;
    this.parentId = parentId;
  }

  validate() {
    const errors = [];

    // Validate content
    if (!this.content || typeof this.content !== 'string') {
      errors.push('Content is required and must be a string');
    } else if (this.content.trim().length === 0) {
      errors.push('Content cannot be empty');
    } else if (this.content.length > 1000) {
      errors.push('Content cannot exceed 1000 characters');
    }

    // Validate answerId
    if (!this.answerId || typeof this.answerId !== 'string') {
      errors.push('Answer ID is required and must be a string');
    }

    // Validate parentId (optional)
    if (this.parentId && typeof this.parentId !== 'string') {
      errors.push('Parent ID must be a string');
    }

    return {
      isValid: errors.length === 0,
      errors: errors,
    };
  }

  sanitize() {
    return {
      content: this.content ? this.content.trim() : '',
      answerId: this.answerId,
      parentId: this.parentId || null,
    };
  }
}

class ReplyEditRequest {
  constructor(content) {
    this.content = content;
  }

  validate() {
    const errors = [];

    // Validate content
    if (!this.content || typeof this.content !== 'string') {
      errors.push('Content is required and must be a string');
    } else if (this.content.trim().length === 0) {
      errors.push('Content cannot be empty');
    } else if (this.content.length > 1000) {
      errors.push('Content cannot exceed 1000 characters');
    }

    return {
      isValid: errors.length === 0,
      errors: errors,
    };
  }

  sanitize() {
    return {
      content: this.content ? this.content.trim() : '',
    };
  }
}

module.exports = {
  ReplyRequest,
  ReplyEditRequest,
};
