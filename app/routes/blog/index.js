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
router.put(
  '/:blogSlug/edit',
  authMiddleware,
  upload.single('coverImage'),
  blogController.updateBlog
);
router.get('/:blogSlug', blogController.getBlogDetail);

/* 
  Temporary remove authMiddleware for testing purpose. I haven't figured out why it didn't work with authMiddleware.
  Expected response is blogs created by specific user with userId.
*/
router.get('/user/:userId', blogController.getUserBlogs);

module.exports = router;
