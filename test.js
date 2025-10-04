const chatService = require('../services/chat/Chat.service');

function setupChatSocket(io) {
  io.on('connection', (socket) => {
    socket.on('join_conversation', (conversationId) => {
      socket.join(conversationId);
    });

    socket.on('leave_conversation', (conversationId) => {
      socket.leave(conversationId);
    });

    socket.on('send_message', async (data) => {
      try {
        const { conversationId, senderId, content } = data;
        const savedMessage = await chatService.sendMessage(
          conversationId,
          senderId,
          content
        );

        io.to(conversationId).emit('new_message', savedMessage);
      } catch (error) {
        socket.emit('message_error', { error: error.message });
      }
    });

    socket.on('disconnect', () => {});
  });
}

module.exports = setupChatSocket;
