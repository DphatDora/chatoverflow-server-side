const chatService = require('../services/chat/Chat.service');

function setupChatSocket(io) {
  io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    /* Handle user joining a conversation room */
    socket.on('join_conversation', (conversationId) => {
      socket.join(conversationId);
      console.log(`Socket ${socket.id} joined conversation: ${conversationId}`);
    });

    /* Handle user leaving a conversation room */
    socket.on('leave_conversation', (conversationId) => {
      socket.leave(conversationId);
      console.log(`Socket ${socket.id} left conversation: ${conversationId}`);
    });

    /* Handle sending a message */
    socket.on('send_message', async (data) => {
      try {
        const { conversationId, senderId, content } = data;

        /* Save message to database using existing service */
        const savedMessage = await chatService.sendMessage(
          conversationId,
          senderId,
          content
        );

        /* Broadcast the new message to everyone in the conversation room */
        io.to(conversationId).emit('new_message', savedMessage);

        console.log(
          `Message sent to conversation ${conversationId}:`,
          savedMessage
        );
      } catch (error) {
        console.error('Error sending message:', error);
        socket.emit('message_error', { error: error.message });
      }
    });

    /* Handle disconnection */
    socket.on('disconnect', () => {
      console.log('User disconnected:', socket.id);
    });
  });
}

module.exports = setupChatSocket;
