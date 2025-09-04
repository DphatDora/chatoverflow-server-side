const Question = require("../models/Question.model");
const Answer = require("../models/Answer.model");

async function getNewest(limit = 20) {
  return Question.find()
    .sort({ createdAt: -1 })
    .limit(limit)
    .populate("user", "name avatar")
    .populate("answerCount");
}

async function getTrending(limit = 20) {
  return Question.aggregate([
    {
      $addFields: {
        upvoteCount: { $size: "$upvotedBy" },
      },
    },
    {
      $lookup: {
        from: "answers",
        localField: "_id",
        foreignField: "question",
        as: "answers",
      },
    },
    {
      $addFields: {
        answerCount: { $size: "$answers" },
      },
    },
    { $sort: { views: -1, upvoteCount: -1 } },
    { $limit: limit },
    {
      $project: {
        answers: 0,
      },
    },
  ]);
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
    { $match: { "answers.0": { $exists: false } } },
    { $sort: { createdAt: -1 } },
    { $limit: limit },
    {
      $addFields: { answerCount: 0 },
    },
  ]);
}

module.exports = {
  getNewest,
  getTrending,
  getUnanswered,
};
