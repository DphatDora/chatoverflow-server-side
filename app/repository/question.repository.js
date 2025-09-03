const Question = require("../models/Question.model");
const Answer = require("../models/Answer.model");

async function getNewest(limit = 20) {
  return Question.find()
    .sort({ createdAt: -1 })
    .limit(limit)
    .populate("user", "name avatar");
}

async function getTrending(limit = 20) {
  const questions = await Question.aggregate([
    {
      $addFields: {
        upvoteCount: { $size: "$upvotedBy" },
      },
    },
    {
      $sort: { views: -1, upvoteCount: -1 },
    },
    { $limit: limit },
  ]);

  return Question.populate(questions, { path: "user", select: "name avatar" });
}

async function getUnanswered(limit = 20) {
  return Question.aggregate([
    {
      $lookup: {
        from: "answers",
        localField: "_id",
        foreignField: "question",
        as: "answers",
      },
    },
    { $match: { answers: { $size: 0 } } },
    { $sort: { createdAt: -1 } },
    { $limit: limit },
  ]);
}

module.exports = {
  getNewest,
  getTrending,
  getUnanswered,
};
