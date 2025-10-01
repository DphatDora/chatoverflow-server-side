const express = require('express');
const router = express.Router();

const chatController = require('../../controller/chat/Chat.controller');

router.get('/conversations/:userId', chatController.getConversations);
router.post('/conversations', chatController.createConversation);

router.get('/messages/:conversationId', chatController.getMessages);
router.post('/messages', chatController.sendMessage);

module.exports = router;
