const mongoose = require('mongoose');
const Conversation = require('../../models/Conversation.model');
require('dotenv').config();

async function seedConversations() {
  const conversationData = [];

  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    await Conversation.deleteMany({});
    console.log('Cleared existing conversations');

    const userIds = [
      '68cacc5509bc97efbb83ac04',
      '68cacc5509bc97efbb83ac05',
      '68cacc5509bc97efbb83ac07',
      '68cacc5509bc97efbb83ac09',
      '68cacc5509bc97efbb83ac0a',
      '68cacc5509bc97efbb83ac0c',
      '68cacc5509bc97efbb83ac0f',
      '68cacc5509bc97efbb83ac10',
      '68cacc5509bc97efbb83ac1a',
      '68cacc5509bc97efbb83ac06',
    ];

    for (let i = 0; i < 20; i++) {
      /* 
        Pick two random users 
        If they are the same, loop and pick again until they are separate.
      */
      const participant1 = userIds[Math.floor(Math.random() * userIds.length)];
      let participant2 = userIds[Math.floor(Math.random() * userIds.length)];

      while (participant2 === participant1) {
        participant2 = userIds[Math.floor(Math.random() * userIds.length)];
      }

      conversationData.push({
        participantIDs: [participant1, participant2],
      });
    }

    const result = await Conversation.insertMany(conversationData);
    console.log(`Successfully seeded ${result.length} conversations`);
  } catch (error) {
    console.error('Error seeding conversations:', error);
  } finally {
    await mongoose.connection.close();
    console.log('Database connection closed');
  }
}

seedConversations();
