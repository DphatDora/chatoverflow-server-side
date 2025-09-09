require('dotenv').config();
const mongoose = require('mongoose');
const Question = require('../../models/Question.model');
const User = require('../../models/User.model');
const { syncTagCounts } = require('../../utils/tagSync');

async function seedQuestions() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);

    // Clear old data
    await Question.deleteMany({});
    // Reset tag counts to 0 since we cleared all questions
    const Tag = require('../../models/Tag.model');
    await Tag.updateMany({}, { questionCount: 0 });
    console.log('🧹 Cleared old questions and reset tag counts');

    const users = await User.find();
    if (users.length < 2) {
      throw new Error(
        '⚠️ Need at least 2 users! Please run seederUser.js first'
      );
    }

    const [user1, user2, user3] = users;

    const questions = [
      {
        title: 'How to fix React useEffect infinite loop?',
        content: 'My useEffect keeps running infinitely. How can I fix this?',
        tags: ['react', 'javascript'],
        views: 120,
        user: user1._id,
        upvotedBy: [user2._id, user3._id],
        downvotedBy: [],
      },
      {
        title: 'Best practices for MongoDB schema design?',
        content: 'Should I embed or reference documents in MongoDB schemas?',
        tags: ['mongodb', 'database'],
        views: 800,
        user: user2._id,
        upvotedBy: [user1._id],
        downvotedBy: [user3._id],
      },
      {
        title: 'Difference between let, var, and const in JavaScript?',
        content: 'When should I use let, var, and const?',
        tags: ['javascript', 'es6'],
        views: 50,
        user: user3._id,
        upvotedBy: [],
        downvotedBy: [user1._id],
      },
    ];

    // Option 1: Slow but reliable - each question triggers save middleware
    // await Question.createManyWithTags(questions);

    // Option 2: Fast bulk insert with batch tag update
    await Question.insertManyWithTags(questions);

    console.log('✅ Seed questions success!');

    process.exit(0);
  } catch (err) {
    console.error('❌ Seed questions failed:', err.message);
    process.exit(1);
  }
}

seedQuestions();
