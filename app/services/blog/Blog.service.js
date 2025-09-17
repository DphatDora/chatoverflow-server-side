const blogRepository = require('../../repository/blog.repository');

exports.createBlog = async (blogReq) => {
  const { title, content_html, summary, coverImage, tags, user } = blogReq;

  if (!title || !content_html) {
    throw new Error('Title và content_html là bắt buộc');
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
    throw new Error('Blog không tồn tại');
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
    throw new Error('Không tìm thấy blog để cập nhật');
  }
  return updatedBlog;
};

exports.getUserBlogs = async (userId) => {
  return await blogRepository.getUserBlogs(userId);
};
