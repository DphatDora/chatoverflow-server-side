const User = require('../../models/User.model');
const chatRepository = require('../../repository/chat.repository');

exports.getUserConversations = async (userId) => {
  const conversations = await chatRepository.getConversationsByUserId(userId);

  const conversationsWithTargets = await Promise.all(
    conversations.map(async (conv) => {
      const targetUserId = conv.participantIDs.find((id) => id !== userId);
      const targetUser = await User.findById(targetUserId);

      return {
        id: conv._id.toString(),
        targetName: targetUser.name,
        targetAvatar: targetUser.avatar,
      };
    })
  );

  return conversationsWithTargets;
};

exports.getConversationMessages = async (conversationId) => {
  const messages = await chatRepository.getMessagesByConversationId(
    conversationId
  );

  const messagesViewModel = await Promise.all(
    messages.map(async (message) => {
      const sender = await User.findById(message.senderId);
      const senderName = sender.name;

      return {
        id: message._id.toString(),
        senderId: message.senderId,
        senderName: senderName,
        content: message.content,
        createdAt: message.createdAt,
      };
    })
  );

  return messagesViewModel;
};

exports.sendMessage = async (conversationId, senderId, content) => {
  const newMessage = await chatRepository.createMessage(
    conversationId,
    senderId,
    content
  );

  const sender = await User.findById(senderId);

  return {
    id: newMessage._id.toString(),
    senderId: newMessage.senderId,
    senderName: sender.name,
    content: newMessage.content,
    createdAt: newMessage.createdAt,
  };
};

exports.createConversation = async (userId1, userId2) => {
  /* Check if conversation already exists */
  const existingConversation =
    await chatRepository.findConversationByParticipants(userId1, userId2);

  if (existingConversation) {
    /* In case conversation exists, we still need to send back the target user info */
    const targetUserId = existingConversation.participantIDs.find(
      (id) => id !== userId1
    );
    const targetUser = await User.findById(targetUserId);

    return {
      id: existingConversation._id.toString(),
      targetName: targetUser.name,
      targetAvatar: targetUser.avatar,
      isNew: false,
    };
  }

  const newConversation = await chatRepository.createConversation(
    userId1,
    userId2
  );
  const targetUser = await User.findById(userId2);

  return {
    id: newConversation._id.toString(),
    targetName: targetUser.name,
    targetAvatar: targetUser.avatar,
    isNew: true,
  };
};
