const questionRepository = require('../../repository/question.repository');
const Question = require('../../models/Question.model');

async function getQuestionsByType(type) {
  switch (type) {
    case 'newest':
      return questionRepository.getNewest();
    case 'trending':
      return questionRepository.getTrending();
    case 'unanswer':
      return questionRepository.getUnanswered();
    default:
      return null;
  }
}

async function getQuestionDetail(id) {
  return questionRepository.getQuestionDetailById(id);
}

async function createQuestion(payload) {
  const { title, content, tags, user } = payload;

  if (!title || !content || !user) {
    throw new Error('Required fields are missing (title, content, user)');
  }

  const question = new Question({
    title,
    content,
    tags,
    user,
  });

  return await question.save();
}

async function updateQuestion(questionId, data) {
  const question = await Question.findById(questionId);
  if (!question) throw new Error('Question not found');

  if (data.title !== undefined) question.title = data.title;
  if (data.content !== undefined) question.content = data.content;
  if (data.tags !== undefined) question.tags = data.tags;

  await question.save();
  return question;
}

async function getUserQuestions(userId) {
  return questionRepository.getQuestionsByUserId(userId);
}

async function upvoteQuestion(questionId, userId) {
  const question = await Question.findById(questionId);
  if (!question) throw new Error('Question not found');

  const hasUpvoted = question.upvotedBy.includes(userId);
  const hasDownvoted = question.downvotedBy.includes(userId);

  if (hasUpvoted) {
    question.upvotedBy.pull(userId);
  } else {
    question.upvotedBy.push(userId);
    if (hasDownvoted) question.downvotedBy.pull(userId);
  }

  await question.save();

  return {
    upvotes: question.upvotedBy.length,
    downvotes: question.downvotedBy.length,
    userUpvoted: question.upvotedBy.includes(userId),
    userDownvoted: question.downvotedBy.includes(userId),
    userUpvotedLength: question.upvotedBy.length,
    userDownvotedLength: question.downvotedBy.length,
  };
}
async function downvoteQuestion(questionId, userId) {
  const question = await Question.findById(questionId);
  if (!question) throw new Error('Question not found');

  const hasDownvoted = question.downvotedBy.includes(userId);
  const hasUpvoted = question.upvotedBy.includes(userId);

  if (hasDownvoted) {
    question.downvotedBy.pull(userId);
  } else {
    question.downvotedBy.push(userId);
    if (hasUpvoted) question.upvotedBy.pull(userId);
  }

  await question.save();

  return {
    upvotes: question.upvotedBy.length,
    downvotes: question.downvotedBy.length,
    userUpvoted: question.upvotedBy.includes(userId),
    userDownvoted: question.downvotedBy.includes(userId),
    userUpvotedLength: question.upvotedBy.length,
    userDownvotedLength: question.downvotedBy.length,
  };
}

async function voteStatus(questionId, userId) {
  const question = await Question.findById(questionId);
  return {
    upvoted: question.upvotedBy.includes(userId),
    downvoted: question.downvotedBy.includes(userId),
  };
}

module.exports = {
  getQuestionsByType,
  getQuestionDetail,
  createQuestion,
  updateQuestion,
  getUserQuestions,
  upvoteQuestion,
  downvoteQuestion,
  voteStatus,
};
