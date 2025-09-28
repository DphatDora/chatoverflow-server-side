const Conversation = require('../models/Conversation.model');

exports.getConversationsByUserId = async (userId) => {
  return await Conversation.find({
    participantIDs: userId,
  }).sort({ updatedAt: -1 });
};
