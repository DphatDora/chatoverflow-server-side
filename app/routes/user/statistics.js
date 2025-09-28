const express = require('express');
const router = express.Router();
const userInfoController = require('../../controller/user/UserInfo.controller');

router.get('/', userInfoController.getUserStatistics);

module.exports = router;
