const blogService = require('../../services/blog/blog.service');
const ApiResponse = require('../../dto/res/api.response');
const {
  NewBlogItemResponse,
  NewBlogDetailResponse,
} = require('../../dto/res/blog.response');
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
