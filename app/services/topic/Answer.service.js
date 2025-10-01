const answerRepository = require('../../repository/answer.repository');
const Answer = require('../../models/Answer.model');
const Question = require('../../models/Question.model');
const mongoose = require('mongoose');
const { DEFAULT_ANSWER_SORT } = require('../../constants/filters/answer');
const NotificationService = require('../common/notification.service');

class AnswerService {
  async getAnswersByQuestion(
    questionId,
    page = 1,
    limit = 10,
    sortBy = DEFAULT_ANSWER_SORT
  ) {
    return await answerRepository.findByQuestion(
      questionId,
      page,
      limit,
      sortBy
    );
  }

  async getTotalAnswersByQuestion(questionId) {
    return await answerRepository.getTotalByQuestion(questionId);
  }

  async addAnswer({ questionId, userId, content }) {
    const answer = await answerRepository.create({
      question: questionId,
      user: userId,
      content,
    });

    // Send notification to question owner
    const question = await Question.findById(questionId).populate(
      'user',
      'name nickName email'
    );
    const questionOwnerIdString = question?.user?._id?.toString();
    const answerUserIdString = userId.toString();

    if (
      question &&
      question.user &&
      questionOwnerIdString !== answerUserIdString
    ) {
      await NotificationService.createNotification(
        questionOwnerIdString,
        'new_answer',
        {
          questionId: question._id.toString(),
          questionTitle: question.title,
          answerContent:
            content.length > 200 ? content.substring(0, 200) + '...' : content,
          answererId: answerUserIdString,
          questionUrl: `${
            process.env.FRONTEND_BASE_URL || 'http://localhost:5173'
          }/question/${question._id}`,
        }
      );
    }

    return answer;
  }

  async upvoteAnswer(answerId, userId) {
    const answer = await Answer.findById(answerId).populate(
      'user',
      'name nickName email'
    );
    if (!answer) throw new Error('Answer not found');

    const hasUpvoted = answer.upvotedBy.includes(userId);
    const hasDownvoted = answer.downvotedBy.includes(userId);

    if (hasUpvoted) {
      answer.upvotedBy.pull(userId);
    } else {
      answer.upvotedBy.push(userId);
      if (hasDownvoted) answer.downvotedBy.pull(userId);

      // Send notification for upvote
      const answerOwnerIdString = answer.user?._id?.toString();
      const voterUserIdString = userId.toString();

      if (answer.user && answerOwnerIdString !== voterUserIdString) {
        const question = await Question.findById(answer.question);
        await NotificationService.createNotification(
          answerOwnerIdString,
          'answer_upvote',
          {
            answerId: answer._id.toString(),
            questionId: answer.question.toString(),
            questionTitle: question?.title || 'Unknown Question',
            totalUpvotes: answer.upvotedBy.length + 1,
            voterUserId: voterUserIdString,
            answerUrl: `${
              process.env.FRONTEND_BASE_URL || 'http://localhost:5173'
            }/question/${answer.question}#answer-${answer._id}`,
          }
        );
      }
    }

    await answer.save();

    return {
      upvotes: answer.upvotedBy.length,
      downvotes: answer.downvotedBy.length,
      userUpvoted: answer.upvotedBy.includes(userId),
      userDownvoted: answer.downvotedBy.includes(userId),
    };
  }

  async downvoteAnswer(answerId, userId) {
    const answer = await Answer.findById(answerId).populate(
      'user',
      'name nickName email'
    );
    if (!answer) throw new Error('Answer not found');

    const hasDownvoted = answer.downvotedBy.includes(userId);
    const hasUpvoted = answer.upvotedBy.includes(userId);

    if (hasDownvoted) {
      answer.downvotedBy.pull(userId);
    } else {
      answer.downvotedBy.push(userId);
      if (hasUpvoted) answer.upvotedBy.pull(userId);

      // Send notification for downvote
      const answerOwnerIdString = answer.user?._id?.toString();
      const voterUserIdString = userId.toString();

      if (answer.user && answerOwnerIdString !== voterUserIdString) {
        const question = await Question.findById(answer.question);
        await NotificationService.createNotification(
          answerOwnerIdString,
          'answer_downvote',
          {
            answerId: answer._id.toString(),
            questionId: answer.question.toString(),
            questionTitle: question?.title || 'Unknown Question',
            totalDownvotes: answer.downvotedBy.length + 1,
            voterUserId: voterUserIdString,
            answerUrl: `${
              process.env.FRONTEND_BASE_URL || 'http://localhost:5173'
            }/question/${answer.question}#answer-${answer._id}`,
          }
        );
      }
    }

    await answer.save();

    return {
      upvotes: answer.upvotedBy.length,
      downvotes: answer.downvotedBy.length,
      userUpvoted: answer.upvotedBy.includes(userId),
      userDownvoted: answer.downvotedBy.includes(userId),
    };
  }

  async voteStatusAnswer(answerId, userId) {
    const answer = await Answer.findById(answerId);
    if (!answer) throw new Error('Answer not found');

    return {
      upvoted: answer.upvotedBy.includes(userId),
      downvoted: answer.downvotedBy.includes(userId),
    };
  }

  async editAnswer(answerId, userId, content) {
    const answer = await Answer.findById(answerId);
    if (!answer) throw new Error('Answer not found');

    if (answer.user.toString() !== userId) {
      throw new Error('You are not authorized to edit this answer');
    }

    answer.content = content;
    await answer.save();
    return answer;
  }

  async deleteAnswer(answerId, userId) {
    const answer = await answerRepository.findById(answerId);
    if (!answer) throw new Error('Answer not found');

    if (answer.user.toString() !== userId) {
      throw new Error('You are not authorized to delete this answer');
    }

    try {
      await answerRepository.deleteRepliesByAnswer(answerId);

      await answerRepository.deleteAnswer(answerId);

      return { success: true, message: 'Answer and related replies deleted' };
    } catch (err) {
      console.error('Failed to delete answer:', err);
      throw new Error('Failed to delete answer and related replies');
    }
  }

  async isAnswerOwner(answerId, userId) {
    const answer = await Answer.findById(answerId);
    if (!answer) throw new Error('Answer not found');
    return answer.user.toString() === userId;
  }
}

module.exports = new AnswerService();
