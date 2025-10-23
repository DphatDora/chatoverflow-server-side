const express = require('express');
const router = express.Router({ mergeParams: true }); // ← Thêm này để nhận params từ parent

const userInfoController = require('../../controller/user/UserInfo.controller');

// Get user profile with posts and statistics
router.get('/', userInfoController.getUserPosts);

module.exports = router;
