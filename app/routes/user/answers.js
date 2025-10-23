const express = require('express');
const router = express.Router({ mergeParams: true }); // ← Thêm này để nhận params từ parent
const userInfoController = require('../../controller/user/UserInfo.controller');
const auth = require('../../middleware/App.middleware');

// Get user profile with posts and statistics
router.get('/', userInfoController.getUserAnswers);

module.exports = router;
