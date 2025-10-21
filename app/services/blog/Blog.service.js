const blogRepository = require('../../repository/blog.repository');
const NotificationService = require('../common/notification.service');
const {
  BLOG_SORT_OPTIONS,
  DEFAULT_BLOG_SORT,
} = require('../../constants/filters/blog');

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
  const sortBy = req.query.sortBy || DEFAULT_BLOG_SORT;

  // Parse tags from query string
  let tags = [];
  if (req.query.tags) {
    tags = Array.isArray(req.query.tags)
      ? req.query.tags
      : req.query.tags.split(',').map((tag) => tag.trim());
  }

  // Validate sortBy
  const validSortOptions = Object.values(BLOG_SORT_OPTIONS);
  const finalSortBy = validSortOptions.includes(sortBy)
    ? sortBy
    : DEFAULT_BLOG_SORT;

  const { blogs, total } = await blogRepository.getBlogList({
    page,
    limit,
    sortBy: finalSortBy,
    tags,
  });

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

  const updatedBlog = await blogRepository.voteBlog(blogSlug, userId, voteType);

  // Send notification for blog upvote
  if (voteType === 'upvote' && updatedBlog && updatedBlog.user) {
    const blogOwnerIdString = updatedBlog.user._id.toString();
    const voterUserIdString = userId.toString();

    if (
      blogOwnerIdString !== voterUserIdString &&
      updatedBlog.upvotedBy.includes(userId)
    ) {
      await NotificationService.createNotification(
        blogOwnerIdString,
        'blog_upvote',
        {
          blogId: updatedBlog._id.toString(),
          blogTitle: updatedBlog.title,
          blogSlug: updatedBlog.slug,
          totalUpvotes: updatedBlog.upvotedBy.length,
          voterUserId: voterUserIdString,
          blogUrl: `${
            process.env.FRONTEND_BASE_URL || 'http://localhost:5173'
          }/blog/${updatedBlog.slug}`,
        }
      );
    }
  }

  return updatedBlog;
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

  const comment = await blogRepository.createComment(commentData);

  // Send notification to blog owner
  if (blog.user) {
    const blogOwnerIdString = blog.user._id.toString();
    const commenterIdString = userId.toString();

    if (blogOwnerIdString !== commenterIdString) {
      await NotificationService.createNotification(
        blogOwnerIdString,
        'new_blog_comment',
        {
          blogId: blog._id.toString(),
          blogTitle: blog.title,
          blogSlug: blog.slug,
          commentContent:
            content.length > 200 ? content.substring(0, 200) + '...' : content,
          commenterId: commenterIdString,
          blogUrl: `${
            process.env.FRONTEND_BASE_URL || 'http://localhost:5173'
          }/blog/${blog.slug}`,
        }
      );
    }
  }

  return comment;
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

  const updatedComment = await blogRepository.voteComment(
    commentId,
    userId,
    voteType
  );

  // Send notification for comment upvote
  if (
    voteType === 'upvote' &&
    updatedComment &&
    updatedComment.user &&
    updatedComment.blog
  ) {
    const commentOwnerIdString = updatedComment.user._id.toString();
    const voterUserIdString = userId.toString();

    if (
      commentOwnerIdString !== voterUserIdString &&
      updatedComment.upvotedBy.includes(userId)
    ) {
      await NotificationService.createNotification(
        commentOwnerIdString,
        'blog_comment_upvote',
        {
          commentId: updatedComment._id.toString(),
          blogId: updatedComment.blog._id.toString(),
          blogTitle: updatedComment.blog.title,
          blogSlug: updatedComment.blog.slug,
          totalUpvotes: updatedComment.upvotedBy.length,
          voterUserId: voterUserIdString,
          commentUrl: `${
            process.env.FRONTEND_BASE_URL || 'http://localhost:5173'
          }/blog/${updatedComment.blog.slug}#comment-${updatedComment._id}`,
        }
      );
    }
  }

  return updatedComment;
};

exports.checkBlogVote = async (slug, userId) => {
  return await blogRepository.checkUserVote(slug, userId);
};

exports.deleteBlog = async (blogSlug, userId) => {
  const blog = await blogRepository.getBlogBySlug(blogSlug);
  if (!blog) {
    throw new Error('Blog not found');
  }

  // Check if user is the owner
  if (blog.user._id.toString() !== userId.toString()) {
    throw new Error('You are not authorized to delete this blog');
  }

  try {
    // Delete all comments related to this blog
    await blogRepository.deleteCommentsByBlog(blog._id);

    // Delete the blog
    await blogRepository.deleteBlog(blogSlug);

    return { success: true, message: 'Blog and related comments deleted' };
  } catch (err) {
    console.error('Failed to delete blog:', err);
    throw new Error('Failed to delete blog and related comments');
  }
};

exports.isBlogOwner = async (blogSlug, userId) => {
  const blog = await blogRepository.getBlogBySlug(blogSlug);
  if (!blog) {
    throw new Error('Blog not found');
  }
  return blog.user._id.toString() === userId.toString();
};
