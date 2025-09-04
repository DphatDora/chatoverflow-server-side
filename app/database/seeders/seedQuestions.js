require("dotenv").config();
const mongoose = require("mongoose");
const Question = require("../../models/Question.model");
const User = require("../../models/User.model");

async function seedQuestions() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);

    await Question.deleteMany({});
    console.log("🧹 Cleared old questions");

    const users = await User.find();
    if (users.length < 2) {
      throw new Error(
        "⚠️ Need at least 2 users! Please run seederUser.js first"
      );
    }

    const [user1, user2, user3] = users;

    const questions = [
      {
        title: "How to fix React useEffect infinite loop?",
        content: "My useEffect keeps running infinitely. How can I fix this?",
        tags: ["react", "javascript"],
        views: 120,
        user: user1._id,
        upvotedBy: [user2._id, user3._id],
        downvotedBy: [],
      },
      {
        title: "Best practices for MongoDB schema design?",
        content: "Should I embed or reference documents in MongoDB schemas?",
        tags: ["mongodb", "database"],
        views: 800,
        user: user2._id,
        upvotedBy: [user1._id],
        downvotedBy: [user3._id],
      },
      {
        title: "Difference between let, var, and const in JavaScript?",
        content: "When should I use let, var, and const?",
        tags: ["javascript", "es6"],
        views: 50,
        user: user3._id,
        upvotedBy: [],
        downvotedBy: [user1._id],
      },
    ];

    await Question.insertMany(questions);
    console.log("✅ Seed questions success!");
    process.exit(0);
  } catch (err) {
    console.error("❌ Seed questions failed:", err.message);
    process.exit(1);
  }
}

seedQuestions();
