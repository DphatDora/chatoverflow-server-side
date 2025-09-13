require('dotenv').config();
const mongoose = require('mongoose');
const Answer = require('../../models/Answer.model');
const Question = require('../../models/Question.model');
const User = require('../../models/User.model');

const seedAnswers = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB connected');

    const users = await User.find();
    const questions = await Question.find();

    if (users.length === 0 || questions.length === 0) {
      console.log('Seed users and questions first!');
      return;
    }

    // Xóa answer cũ
    await Answer.deleteMany({});
    console.log('Existing answers deleted');

    const answersData = [];

    for (let i = 1; i <= 60; i++) {
      const randomUser = users[Math.floor(Math.random() * users.length)];
      const randomQuestion =
        questions[Math.floor(Math.random() * questions.length)];

      // random upvote/downvote
      const upvotedBy = [];
      const downvotedBy = [];
      users.forEach((user) => {
        const rand = Math.random();
        if (rand < 0.1) upvotedBy.push(user._id); // 10% chance
        else if (rand < 0.15) downvotedBy.push(user._id); // 5% chance
      });

      answersData.push({
        content: `This is the content of answer ${i}`,
        question: randomQuestion._id,
        user: randomUser._id,
        upvotedBy,
        downvotedBy,
      });
    }

    await Answer.insertMany(answersData);
    console.log('60 answers inserted');

    mongoose.disconnect();
  } catch (err) {
    console.error(err);
  }
};

seedAnswers();
