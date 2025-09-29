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
