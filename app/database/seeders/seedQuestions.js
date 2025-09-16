require('dotenv').config();
const mongoose = require('mongoose');
const Question = require('../../models/Question.model');
const User = require('../../models/User.model');

const seedQuestions = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB connected');


    // Lấy tất cả user để assign vào question
    const users = await User.find();
    if (users.length === 0) {
      console.log('No users found. Seed users first!');
      return;

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

    // Xóa questions cũ
    await Question.deleteMany({});
    console.log('Existing questions deleted');


    const questionsData = [];

    for (let i = 1; i <= 60; i++) {
      const randomUser = users[Math.floor(Math.random() * users.length)];

      questionsData.push({
        title: `Sample Question ${i}`,
        content: `This is the content of question ${i}. Lorem ipsum dolor sit amet.`,
        tags: [`tag${i % 5}`, `tag${(i + 1) % 5}`],
        askedTime: new Date(Date.now() - i * 1000 * 60 * 60),
        views: Math.floor(Math.random() * 100),
        user: randomUser._id,

    await Question.insertMany(questionsData);
    console.log('30 questions inserted');

    mongoose.disconnect();
  } catch (err) {
    console.error('❌ Seed questions failed:', err.message);
    process.exit(1);
  }
};

seedQuestions();
