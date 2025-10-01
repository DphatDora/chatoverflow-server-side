require('dotenv').config();
const mongoose = require('mongoose');
const Conversation = require('../../models/Conversation.model');
const User = require('../../models/User.model');

async function seedConversations() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    await Conversation.deleteMany({});
    console.log('Cleared existing conversations');

    // Fetch all users from database
    const users = await User.find({});

    if (users.length < 2) {
      console.error(
        'Need at least 2 users in database. Run seedUser.js first!'
      );
      process.exit(1);
    }

    const userIds = users.map((user) => user._id.toString());
    const conversationData = [];

    // Create 20 random conversations
    for (let i = 0; i < 20; i++) {
      // Pick two random different users
      const idx1 = Math.floor(Math.random() * userIds.length);
      let idx2 = Math.floor(Math.random() * userIds.length);

      while (idx2 === idx1) {
        idx2 = Math.floor(Math.random() * userIds.length);
      }

      conversationData.push({
        participantIDs: [userIds[idx1], userIds[idx2]],
      });
    }

    const result = await Conversation.insertMany(conversationData);
    console.log(`✅ Successfully seeded ${result.length} conversations`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding conversations:', error);
    process.exit(1);
  }
}

seedConversations();
