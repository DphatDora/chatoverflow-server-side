const questionRepository = require('../../repository/question.repository');
const Question = require('../../models/Question.model');
const NotificationService = require('../common/notification.service');

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
  const question = await Question.findById(questionId).populate(
    'user',
    'name nickName email'
  );
  if (!question) throw new Error('Question not found');

  const hasUpvoted = question.upvotedBy.includes(userId);
  const hasDownvoted = question.downvotedBy.includes(userId);

  if (hasUpvoted) {
    question.upvotedBy.pull(userId);
  } else {
    question.upvotedBy.push(userId);
    if (hasDownvoted) question.downvotedBy.pull(userId);

    //Send notification for upvote
    const questionOwnerIdString = question.user._id.toString();
    const voterUserIdString = userId.toString();

    if (question.user && questionOwnerIdString !== voterUserIdString) {
      await NotificationService.createNotification(
        questionOwnerIdString,
        'question_upvote',
        {
          questionId: question._id.toString(),
          questionTitle: question.title,
          totalUpvotes: question.upvotedBy.length + 1,
          voterUserId: voterUserIdString,
          questionUrl: `${
            process.env.FRONTEND_BASE_URL || 'http://localhost:5173'
          }/question/${question._id}`,
        }
      );
    }
  }

  await question.save();

  return {
    upvotes: question.upvotedBy.length,
    downvotes: question.downvotedBy.length,
    userUpvoted: question.upvotedBy.includes(userId),
    userDownvoted: question.downvotedBy.includes(userId),
  };
}

async function downvoteQuestion(questionId, userId) {
  const question = await Question.findById(questionId).populate(
    'user',
    'name nickName email'
  );
  if (!question) throw new Error('Question not found');

  const hasDownvoted = question.downvotedBy.includes(userId);
  const hasUpvoted = question.upvotedBy.includes(userId);

  if (hasDownvoted) {
    question.downvotedBy.pull(userId);
  } else {
    question.downvotedBy.push(userId);
    if (hasUpvoted) question.upvotedBy.pull(userId);

    // Send notification for downvote
    const questionOwnerIdString = question.user._id.toString();
    const voterUserIdString = userId.toString();

    if (question.user && questionOwnerIdString !== voterUserIdString) {
      await NotificationService.createNotification(
        questionOwnerIdString,
        'question_downvote',
        {
          questionId: question._id.toString(),
          questionTitle: question.title,
          totalDownvotes: question.downvotedBy.length + 1,
          voterUserId: voterUserIdString,
          questionUrl: `${
            process.env.FRONTEND_BASE_URL || 'http://localhost:5173'
          }/question/${question._id}`,
        }
      );
    }
  }

  await question.save();

  return {
    upvotes: question.upvotedBy.length,
    downvotes: question.downvotedBy.length,
    userUpvoted: question.upvotedBy.includes(userId),
    userDownvoted: question.downvotedBy.includes(userId),
  };
}

async function voteStatus(questionId, userId) {
  try {
    const question = await Question.findById(questionId);
    return {
      upvoted: question.upvotedBy.includes(userId),
      downvoted: question.downvotedBy.includes(userId),
    };
  } catch (error) {
    throw new Error('Error fetching vote status');
  }
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
