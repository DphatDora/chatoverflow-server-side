const express = require('express');
const router = express.Router();
const blogController = require('../../controller/blog/Blog.controller');
const authMiddleware = require('../../middleware/App.middleware');
const upload = require('../../middleware/upload.middleware');
const multer = require('multer');
const ApiResponse = require('../../dto/res/api.response');

// Multer error handler middleware
const handleMulterError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res
        .status(400)
        .json(ApiResponse.error('File quá lớn. Kích thước tối đa là 10MB'));
    }
    return res
      .status(400)
      .json(ApiResponse.error(`Lỗi upload: ${err.message}`));
  } else if (err) {
    return res
      .status(400)
      .json(ApiResponse.error(err.message || 'Lỗi upload file'));
  }
  next();
};

router.get('/', blogController.getBlogList);
router.post(
  '/create',
  authMiddleware,
  upload.single('coverImage'),
  handleMulterError,
  blogController.createBlog
);

router.post(
  '/comments/:commentId/vote',
  authMiddleware,
  blogController.voteComment
);
router.put(
  '/comments/:commentId',
  authMiddleware,
  blogController.updateComment
);
router.delete(
  '/comments/:commentId',
  authMiddleware,
  blogController.deleteComment
);

router.get('/user/:userId', blogController.getUserBlogs);

router.put(
  '/:blogSlug/edit',
  authMiddleware,
  upload.single('coverImage'),
  handleMulterError,
  blogController.updateBlog
);
router.delete('/:blogSlug', authMiddleware, blogController.deleteBlog);
router.post('/:blogSlug/vote', authMiddleware, blogController.voteBlog);
router.post(
  '/:blogSlug/comments',
  authMiddleware,
  blogController.createComment
);
router.get(
  '/:blogSlug/check-vote',
  authMiddleware,
  blogController.checkBlogVote
);
router.get('/:blogSlug/comments', blogController.getComments);
router.get('/:blogSlug', blogController.getBlogDetail);

module.exports = router;
