class BlogRequest {
  constructor({ title, content_html, summary, coverImage, tags }, userId) {
    if (!title || !content_html) {
      const error = new Error('Title và content_html là bắt buộc');
      error.statusCode = 400;
      throw error;
    }

    this.title = title;
    this.content_html = content_html;
    this.summary = summary || '';
    this.coverImage = coverImage || '';
    this.tags = tags || [];
    this.user = userId;
  }
}

module.exports = BlogRequest;
