const blogService = require('../../services/blog/blog.service');
const ApiResponse = require('../../dto/res/api.response');
const {
  NewBlogItemResponse,
  NewBlogDetailResponse,
} = require('../../dto/res/blog.response');
const { NewCommentResponse } = require('../../dto/res/comment.response');
const { StatusCodes, ReasonPhrases } = require('http-status-codes');
const BlogRequest = require('../../dto/req/blog.request');

exports.createBlog = async (req, res) => {
  try {
    let coverImagePath = '';
    if (req.file) {
      coverImagePath = `${process.env.BACKEND_BASE_URL}/${process.env.UPLOAD_BLOG_PATH}/${req.file.filename}`;
    }

    const blogReq = new BlogRequest(
      {
        ...req.body,
        coverImage: coverImagePath,
      },
      req.userId
    );

    const blog = await blogService.createBlog(blogReq);

    res
      .status(StatusCodes.CREATED)
      .json(
        ApiResponse.success(
          'Blog created successfully',
          NewBlogDetailResponse(blog)
        )
      );
  } catch (error) {
    console.error('Create blog error:', error);
    res
      .status(error.statusCode || StatusCodes.BAD_REQUEST)
      .json(ApiResponse.error(error.message || 'Failed to create blog'));
  }
};

exports.getBlogList = async (req, res) => {
  try {
    const { blogs, total, page, limit } = await blogService.getBlogList(req);

    const baseUrl = `${req.protocol}://${req.get('host')}${req.baseUrl}/blog`;

    res.status(StatusCodes.OK).json(
      ApiResponse.withPagination(
        'Blogs retrieved successfully',
        blogs.map((b) => NewBlogItemResponse(b)),
        page,
        limit,
        baseUrl,
        total
      )
    );
  } catch (error) {
    console.error('Get blog list error:', error);
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json(ApiResponse.error(error.message || 'Failed to fetch blog list'));
  }
};

exports.getBlogDetail = async (req, res) => {
  try {
    const blog = await blogService.getBlogDetail(req.params.blogSlug);
    res
      .status(StatusCodes.OK)
      .json(
        ApiResponse.success(
          'Blog retrieved successfully',
          NewBlogDetailResponse(blog)
        )
      );
  } catch (error) {
    console.error('Get blog detail error:', error);
    res
      .status(StatusCodes.NOT_FOUND)
      .json(ApiResponse.error(error.message || 'Blog not found'));
  }
};

exports.updateBlog = async (req, res) => {
  try {
    let coverImagePath;

    if (req.file) {
      coverImagePath = `${process.env.BACKEND_BASE_URL}/${process.env.UPLOAD_BLOG_PATH}/${req.file.filename}`;
    }

    const updateData = { ...req.body };

    if (coverImagePath) {
      updateData.coverImage = coverImagePath;
    }

    const blogReq = new BlogRequest(updateData, req.userId);

    const updatedBlog = await blogService.updateBlog(
      req.params.blogSlug,
      blogReq
    );

    res
      .status(StatusCodes.OK)
      .json(
        ApiResponse.success(
          'Blog updated successfully',
          NewBlogDetailResponse(updatedBlog)
        )
      );
  } catch (error) {
    console.error('Update blog error:', error);
    res
      .status(error.statusCode || StatusCodes.BAD_REQUEST)
      .json(ApiResponse.error(error.message || 'Failed to update blog'));
  }
};

exports.getUserBlogs = async (req, res) => {
  try {
    const blogs = await blogService.getUserBlogs(req.params.userId);
    res
      .status(StatusCodes.OK)
      .json(ApiResponse.success('User blogs retrieved successfully', blogs));
  } catch (error) {
    console.error('Get user blogs error:', error);
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json(ApiResponse.error(error.message || 'Failed to fetch user blogs'));
  }
};

exports.voteBlog = async (req, res) => {
  try {
    const { blogSlug } = req.params;
    const { voteType } = req.body;

    const updatedBlog = await blogService.voteBlog(
      blogSlug,
      req.userId,
      voteType
    );

    res
      .status(StatusCodes.OK)
      .json(
        ApiResponse.success(
          `Blog voted successfully`,
          NewBlogDetailResponse(updatedBlog)
        )
      );
  } catch (error) {
    console.error('Vote blog error:', error);
    res
      .status(error.statusCode || StatusCodes.BAD_REQUEST)
      .json(ApiResponse.error(error.message || 'Failed to vote blog'));
  }
};

exports.createComment = async (req, res) => {
  try {
    const { blogSlug } = req.params;
    const { content } = req.body;

    const comment = await blogService.createComment(
      blogSlug,
      req.userId,
      content
    );

    res
      .status(StatusCodes.CREATED)
      .json(
        ApiResponse.success(
          'Comment created successfully',
          NewCommentResponse(comment)
        )
      );
  } catch (error) {
    console.error('Create comment error:', error);
    res
      .status(error.statusCode || StatusCodes.BAD_REQUEST)
      .json(ApiResponse.error(error.message || 'Failed to create comment'));
  }
};

exports.getComments = async (req, res) => {
  try {
    const { blogSlug } = req.params;
    const { comments, total, page, limit } =
      await blogService.getCommentsByBlog(blogSlug, req);

    const baseUrl = `${req.protocol}://${req.get('host')}${
      req.baseUrl
    }/blog/${blogSlug}/comments`;

    res.status(StatusCodes.OK).json(
      ApiResponse.withPagination(
        'Comments retrieved successfully',
        comments.map((c) => NewCommentResponse(c)),
        page,
        limit,
        baseUrl,
        total
      )
    );
  } catch (error) {
    console.error('Get comments error:', error);
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json(ApiResponse.error(error.message || 'Failed to fetch comments'));
  }
};

exports.voteComment = async (req, res) => {
  try {
    const { commentId } = req.params;
    const { voteType } = req.body;

    const updatedComment = await blogService.voteComment(
      commentId,
      req.userId,
      voteType
    );

    res
      .status(StatusCodes.OK)
      .json(
        ApiResponse.success(
          `Comment ${voteType}d successfully`,
          NewCommentResponse(updatedComment)
        )
      );
  } catch (error) {
    console.error('Vote comment error:', error);
    res
      .status(error.statusCode || StatusCodes.BAD_REQUEST)
      .json(ApiResponse.error(error.message || 'Failed to vote comment'));
  }
};

exports.checkBlogVote = async (req, res) => {
  try {
    const { blogSlug } = req.params;
    const userId = req.userId;
    const result = await blogService.checkBlogVote(blogSlug, userId);

    res
      .status(StatusCodes.OK)
      .json(ApiResponse.success('Vote status retrieved successfully', result));
  } catch (error) {
    console.error('Check blog vote error:', error);
    res
      .status(StatusCodes.NOT_FOUND)
      .json(ApiResponse.error(error.message || 'Blog not found'));
  }
};

exports.getUserVotedBlogs = async (req, res) => {
  try {
    const { userId } = req.params;
    const blogs = await blogService.getUserVotedBlogs(userId);
    res
      .status(StatusCodes.OK)
      .json(
        ApiResponse.success('User voted blogs retrieved successfully', blogs)
      );
  } catch (error) {
    console.error('Get user voted blogs error:', error);
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json(
        ApiResponse.error(error.message || 'Failed to fetch user voted blogs')
      );
  }
};
