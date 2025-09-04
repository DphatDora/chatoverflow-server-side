require("dotenv").config();
const mongoose = require("mongoose");
const Answer = require("../../models/Answer.model");
const Question = require("../../models/Question.model");
const User = require("../../models/User.model");

async function seedAnswers() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);

    await Answer.deleteMany({});
    console.log("🧹 Cleared old answers");

    const user = await User.findOne();
    if (!user) {
      throw new Error("⚠️ No users found! Please run seederUser.js first");
    }

    const questions = await Question.find();
    if (!questions.length) {
      throw new Error(
        "⚠️ No questions found! Please run seederQuestion.js first"
      );
    }

    const answers = [
      {
        content:
          "Add a dependency array to useEffect. Example: useEffect(() => {...}, []).",
        question: questions[0]._id,
        user: user._id,
        upvote: 12,
        downvote: 0,
      },
      {
        content:
          "In MongoDB, embed if tightly coupled, reference if reused across many documents.",
        question: questions[1]._id,
        user: user._id,
        upvote: 20,
        downvote: 1,
      },
      {
        content:
          "Use 'const' by default, 'let' when you need reassignment, and avoid 'var'.",
        question: questions[2]._id,
        user: user._id,
        upvote: 5,
        downvote: 0,
      },
    ];

    await Answer.insertMany(answers);
    console.log("✅ Seed answers success!");
    process.exit(0);
  } catch (err) {
    console.error("❌ Seed answers failed:", err.message);
    process.exit(1);
  }
}

seedAnswers();
