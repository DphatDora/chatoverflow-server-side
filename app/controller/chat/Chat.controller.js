const chatService = require('../../services/chat/Chat.service');

exports.getConversations = async (req, res) => {
  try {
    /* 
        Haven't figured out how to get userId from auth middleware 
        I'll update this to get userId from auth middleware as soon as I know how.
    */
    const userId = req.params.userId;
    const conversations = await chatService.getUserConversations(userId);

    res.json({ success: true, data: conversations });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
