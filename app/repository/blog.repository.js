const Blog = require('../models/Blog.model');
const BlogComment = require('../models/BlogComment.model');

exports.createBlog = async (blogData) => {
  const blog = new Blog(blogData);
  return await blog.save();
};

exports.getBlogList = async ({ page = 1, limit = 10, sortBy, tags }) => {
  const skip = (page - 1) * limit;

  // Build filter query
  let filterQuery = {};

  // Filter by tags if provided
  if (tags && tags.length > 0) {
    filterQuery.tags = { $in: tags };
  }

  // Handle date filter for last 7 days
  if (sortBy === 'last_7_days') {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    filterQuery.createdAt = { $gte: sevenDaysAgo };
  }

  // Check if aggregation is needed (for vote sorting)
  const needsAggregation =
    sortBy === 'highest_votes' || sortBy === 'lowest_votes';

  if (needsAggregation) {
    // Use aggregation for vote-based sorting
    const pipeline = [
      { $match: filterQuery },
      {
        $addFields: {
          voteScore: {
            $subtract: [
              { $size: { $ifNull: ['$upvotedBy', []] } },
              { $size: { $ifNull: ['$downvotedBy', []] } },
            ],
          },
        },
      },
      {
        $sort: {
          voteScore: sortBy === 'highest_votes' ? -1 : 1,
          createdAt: -1,
        },
      },
      { $skip: skip },
      { $limit: limit },
      {
        $lookup: {
          from: 'users',
          localField: 'user',
          foreignField: '_id',
          as: 'user',
        },
      },
      { $unwind: '$user' },
      {
        $project: {
          'user.password': 0,
          'user.tempPasswordHash': 0,
          'user.__v': 0,
        },
      },
    ];

    const blogs = await Blog.aggregate(pipeline);
    const total = await Blog.countDocuments(filterQuery);

    return { blogs, total };
  } else {
    // Use regular query for other sorting
    let sortOptions = { createdAt: -1 }; // Default: newest

    if (sortBy === 'oldest') {
      sortOptions = { createdAt: 1 };
    } else if (sortBy === 'last_7_days') {
      sortOptions = { createdAt: -1 };
    }

    const blogs = await Blog.find(filterQuery)
      .populate('user', 'avatar nickName')
      .sort(sortOptions)
      .skip(skip)
      .limit(limit);

    const total = await Blog.countDocuments(filterQuery);

    return { blogs, total };
  }
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

exports.getUserBlogs = async (userId) => {
  return await Blog.find({ user: userId }).populate('user', 'avatar nickName');
};

exports.voteBlog = async (blogSlug, userId, voteType) => {
  const blog = await Blog.findOne({ slug: blogSlug });
  if (!blog) {
    throw new Error('Blog không tồn tại');
  }

  const isUpvote = voteType === 'upvote';
  const voteField = isUpvote ? 'upvotedBy' : 'downvotedBy';
  const oppositeField = isUpvote ? 'downvotedBy' : 'upvotedBy';

  // Xóa vote ngược lại nếu có
  await Blog.findOneAndUpdate(
    { slug: blogSlug },
    { $pull: { [oppositeField]: userId } }
  );

  // Toggle vote hiện tại
  const hasVoted = blog[voteField].includes(userId);
  if (hasVoted) {
    // Bỏ vote
    return await Blog.findOneAndUpdate(
      { slug: blogSlug },
      { $pull: { [voteField]: userId } },
      { new: true }
    ).populate('user', 'avatar nickName');
  } else {
    // Thêm vote
    return await Blog.findOneAndUpdate(
      { slug: blogSlug },
      { $addToSet: { [voteField]: userId } },
      { new: true }
    ).populate('user', 'avatar nickName');
  }
};

exports.createComment = async (commentData) => {
  const comment = new BlogComment(commentData);
  await comment.save();
  return await BlogComment.findById(comment._id)
    .populate('user', 'avatar nickName')
    .populate('blog', 'title slug');
};

exports.getCommentsByBlog = async (blogSlug, { page = 1, limit = 10 }) => {
  const blog = await Blog.findOne({ slug: blogSlug });
  if (!blog) {
    throw new Error('Blog không tồn tại');
  }

  const skip = (page - 1) * limit;
  const comments = await BlogComment.find({
    blog: blog._id,
    isDeleted: false,
  })
    .populate('user', 'avatar nickName')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  const total = await BlogComment.countDocuments({
    blog: blog._id,
    isDeleted: false,
  });

  return { comments, total };
};

exports.voteComment = async (commentId, userId, voteType) => {
  const comment = await BlogComment.findById(commentId);
  if (!comment) {
    throw new Error('Comment not found');
  }

  const isUpvote = voteType === 'upvote';
  const voteField = isUpvote ? 'upvotedBy' : 'downvotedBy';
  const oppositeField = isUpvote ? 'downvotedBy' : 'upvotedBy';

  // Xóa vote ngược lại nếu có
  await BlogComment.findByIdAndUpdate(commentId, {
    $pull: { [oppositeField]: userId },
  });

  // Toggle vote hiện tại
  const hasVoted = comment[voteField].includes(userId);
  if (hasVoted) {
    // Bỏ vote
    return await BlogComment.findByIdAndUpdate(
      commentId,
      { $pull: { [voteField]: userId } },
      { new: true }
    )
      .populate('user', 'avatar nickName')
      .populate('blog', 'title slug');
  } else {
    // Thêm vote
    return await BlogComment.findByIdAndUpdate(
      commentId,
      { $addToSet: { [voteField]: userId } },
      { new: true }
    )
      .populate('user', 'avatar nickName')
      .populate('blog', 'title slug');
  }
};

exports.checkUserVote = async (blogSlug, userId) => {
  const blog = await Blog.findOne({ slug: blogSlug });
  if (!blog) {
    throw new Error('Blog not found');
  }

  const isUpvoted = blog.upvotedBy.some(
    (id) => id.toString() === userId.toString()
  );
  const isDownvoted = blog.downvotedBy.some(
    (id) => id.toString() === userId.toString()
  );

  return { isUpvoted, isDownvoted };
};

exports.deleteBlog = async (blogSlug) => {
  return await Blog.deleteOne({ slug: blogSlug });
};

exports.deleteCommentsByBlog = async (blogId) => {
  return await BlogComment.deleteMany({ blog: blogId });
};
