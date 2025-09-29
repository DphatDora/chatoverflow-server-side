const chatRepository = require('../../repository/chat.repository');
const User = require('../../models/User.model');

exports.getUserConversations = async (userId) => {
  const conversations = await chatRepository.getConversationsByUserId(userId);

  const conversationsWithTargets = await Promise.all(
    conversations.map(async (conv) => {
      /* 
        Maybe we need call user repository
        To keep things simple, i'll temporarily find user right here.
      */
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
