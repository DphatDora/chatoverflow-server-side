const Blog = require('../models/Blog.model');

exports.createBlog = async (blogData) => {
  const blog = new Blog(blogData);
  return await blog.save();
};

exports.getBlogList = async ({ page = 1, limit = 10 }) => {
  const skip = (page - 1) * limit;
  const blogs = await Blog.find()
    .populate('user', 'avatar nickName')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);
  const total = await Blog.countDocuments();
  return { blogs, total };
};

exports.getBlogBySlug = async (slug) => {
  return await Blog.findOne({ slug }).populate('user', 'avatar nickName');
};

exports.updateBlogBySlug = async (slug, updateData) => {
  return await Blog.findOneAndUpdate({ slug }, updateData, {
    new: true,
    runValidators: true,
  }).populate('user', 'avatar nickName');
};
