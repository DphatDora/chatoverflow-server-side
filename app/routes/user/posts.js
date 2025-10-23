const express = require('express');
const router = express.Router();
const userInfoController = require('../../controller/user/UserInfo.controller');
const auth = require('../../middleware/App.middleware');

// Get user profile with posts and statistics
router.get('/', userInfoController.getUserPosts);

module.exports = router;
