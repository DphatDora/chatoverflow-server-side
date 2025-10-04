const Conversation = require('../models/Conversation.model');
const Message = require('../models/Message.model');

exports.getConversationsByUserId = async (userId) => {
  return await Conversation.find({
    participantIDs: userId,
  }).sort({ updatedAt: -1 });
};

exports.getMessagesByConversationId = async (conversationId) => {
  return await Message.find({
    conversationId: conversationId,
  }).sort({ createdAt: 1 });
};

exports.createMessage = async (conversationId, senderId, content) => {
  const message = new Message({
    conversationId,
    senderId,
    content,
  });

  return await message.save();
};

exports.findConversationByParticipants = async (userId1, userId2) => {
  return await Conversation.findOne({
    participantIDs: { $all: [userId1, userId2] },
  });
};

exports.createConversation = async (userId1, userId2) => {
  const conversation = new Conversation({
    participantIDs: [userId1, userId2],
  });

  return await conversation.save();
};
