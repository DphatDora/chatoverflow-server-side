const blogRepository = require('../../repository/blog.repository');

exports.createBlog = async (blogReq) => {
  const { title, content_html, summary, coverImage, tags, user } = blogReq;

  if (!title || !content_html) {
    throw new Error('Title and content_html are required');
  }

  const blogData = {
    title,
    content_html,
    summary,
    coverImage,
    tags,
    user,
  };

  return await blogRepository.createBlog(blogData);
};

exports.getBlogList = async (req) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 4;

  const { blogs, total } = await blogRepository.getBlogList({ page, limit });

  return { blogs, total, page, limit };
};

exports.getBlogDetail = async (slug) => {
  const blog = await blogRepository.getBlogBySlug(slug);
  if (!blog) {
    throw new Error('Blog not found');
  }
  return blog;
};

exports.updateBlog = async (slug, blogReq) => {
  const { title, content_html, summary, coverImage, tags, user } = blogReq;

  const updateData = {
    title,
    content_html,
    summary,
    tags,
    user,
  };

  if (coverImage) {
    updateData.coverImage = coverImage;
  }

  const updatedBlog = await blogRepository.updateBlogBySlug(slug, updateData);
  if (!updatedBlog) {
    throw new Error('Blog not found');
  }
  return updatedBlog;
};

exports.getUserBlogs = async (userId) => {
  return await blogRepository.getUserBlogs(userId);
};

exports.voteBlog = async (blogSlug, userId, voteType) => {
  if (!['upvote', 'downvote'].includes(voteType)) {
    throw new Error('invalid vote type');
  }

  return await blogRepository.voteBlog(blogSlug, userId, voteType);
};

exports.createComment = async (blogSlug, userId, content) => {
  if (!content || content.trim().length === 0) {
    throw new Error('comment content is required');
  }

  const blog = await blogRepository.getBlogBySlug(blogSlug);
  if (!blog) {
    throw new Error('Blog not found');
  }

  const commentData = {
    content: content.trim(),
    user: userId,
    blog: blog._id,
  };

  return await blogRepository.createComment(commentData);
};

exports.getCommentsByBlog = async (blogSlug, req) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;

  const { comments, total } = await blogRepository.getCommentsByBlog(blogSlug, {
    page,
    limit,
  });

  return { comments, total, page, limit };
};

exports.voteComment = async (commentId, userId, voteType) => {
  if (!['upvote', 'downvote'].includes(voteType)) {
    throw new Error('invalid vote type');
  }

  return await blogRepository.voteComment(commentId, userId, voteType);
};

exports.checkBlogVote = async (slug, userId) => {
  return await blogRepository.checkUserVote(slug, userId);
};
