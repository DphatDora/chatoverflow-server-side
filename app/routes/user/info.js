const express = require("express");
const router = express.Router();
const userInfoController = require("../../controller/user/UserInfo.controller");
const auth = require("../../middleware/App.middleware");

// Get user info
router.get("/", userInfoController.getUserInfo);

// Update user info
router.put("/", userInfoController.updateUserInfo);

module.exports = router;
