const express = require('express');
const router = express.Router();
const blogController = require('../../controller/blog/Blog.controller');
const authMiddleware = require('../../middleware/App.middleware');
const upload = require('../../middleware/upload.middleware');

router.get('/', blogController.getBlogList);
router.post(
  '/create',
  authMiddleware,
  upload.single('coverImage'),
  blogController.createBlog
);

router.post(
  '/comments/:commentId/vote',
  authMiddleware,
  blogController.voteComment
);

router.get('/user/:userId', blogController.getUserBlogs);

router.put(
  '/:blogSlug/edit',
  authMiddleware,
  upload.single('coverImage'),
  blogController.updateBlog
);
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
