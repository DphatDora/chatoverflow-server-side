const express = require('express');
const router = express.Router();

const chatController = require('../../controller/chat/Chat.controller');

router.get('/conversations/:userId', chatController.getConversations);

module.exports = router;
