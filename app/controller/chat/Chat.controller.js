const chatService = require('../../services/chat/Chat.service');

exports.getConversations = async (req, res) => {
  try {
    const userId = req.params.userId;

    if (!userId) {
      return res
        .status(400)
        .json({ success: false, error: 'User ID is required' });
    }

    const conversations = await chatService.getUserConversations(userId);

    res.json({ success: true, data: conversations });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.getMessages = async (req, res) => {
  try {
    const conversationId = req.params.conversationId;

    if (!conversationId) {
      return res
        .status(400)
        .json({ success: false, error: 'Conversation ID is required' });
    }

    const messages = await chatService.getConversationMessages(conversationId);

    res.json({ success: true, data: messages });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.sendMessage = async (req, res) => {
  try {
    const { conversationId, senderId, content } = req.body;

    if (!conversationId) {
      return res.status(400).json({
        success: false,
        error: 'Conversation ID is required',
      });
    }

    if (!senderId) {
      return res.status(400).json({
        success: false,
        error: 'Sender ID is required',
      });
    }

    if (!content || !content.trim()) {
      return res.status(400).json({
        success: false,
        error: 'Message content is required',
      });
    }

    const message = await chatService.sendMessage(
      conversationId,
      senderId,
      content.trim()
    );

    res.status(201).json({ success: true, data: message });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.createConversation = async (req, res) => {
  try {
    const { userId1, userId2 } = req.body;

    if (!userId1) {
      return res.status(400).json({
        success: false,
        error: 'User ID 1 is required',
      });
    }

    if (!userId2) {
      return res.status(400).json({
        success: false,
        error: 'User ID 2 is required',
      });
    }

    if (userId1 === userId2) {
      return res.status(400).json({
        success: false,
        error: 'Cannot create conversation with yourself',
      });
    }

    const conversation = await chatService.createConversation(userId1, userId2);

    res.status(201).json({ success: true, data: conversation });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
