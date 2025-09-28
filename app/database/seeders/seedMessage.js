const mongoose = require('mongoose');
const Message = require('../../models/Message.model');
const Conversation = require('../../models/Conversation.model');
require('dotenv').config();

async function seedMessages() {
  const messageData = [];

  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    await Message.deleteMany({});
    console.log('Cleared existing messages');

    const conversations = await Conversation.find({});
    if (conversations.length === 0) {
      console.log(
        'No conversations found. Please run seedConversation.js first'
      );
      return;
    }

    const sampleMessages = [
      'Hey there! How are you doing?',
      'Great to chat with you!',
      "What's up?",
      'How was your day?',
      'Did you see that post on Reddit?',
      "LOL that's hilarious!",
      'Thanks for sharing that link',
      'Are you free to chat?',
      'Good morning!',
      'Have a great day!',
      'What are your plans for the weekend?',
      'That sounds awesome!',
      'I totally agree with you',
      "Really? That's interesting!",
      'Let me think about that',
      'Sure, no problem!',
      'Talk to you later!',
      'Thanks for the help!',
      "You're welcome!",
      'See you around!',
    ];

    /* Create 3-8 messages for each conversation */
    for (const conversation of conversations) {
      const messageCount = Math.floor(Math.random() * 6) + 3; // 3-8 messages

      for (let i = 0; i < messageCount; i++) {
        /* Randomly pick sender from participants */
        const senderId =
          conversation.participantIDs[
            Math.floor(Math.random() * conversation.participantIDs.length)
          ];

        const content =
          sampleMessages[Math.floor(Math.random() * sampleMessages.length)];

        messageData.push({
          conversationId: conversation._id.toString(),
          senderId: senderId,
          content: content,
        });
      }
    }

    const result = await Message.insertMany(messageData);
    console.log(
      `Successfully seeded ${result.length} messages across ${conversations.length} conversations`
    );
  } catch (error) {
    console.error('Error seeding messages:', error);
  } finally {
    await mongoose.connection.close();
    console.log('Database connection closed');
  }
}

seedMessages();
