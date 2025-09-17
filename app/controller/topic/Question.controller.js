const questionService = require('../../services/topic/question.service');
const ApiResponse = require('../../dto/res/api.response');
const Question = require('../../models/Question.model');

async function getQuestions(req, res) {
  try {
    const { type } = req.params;
    const { limit } = req.query;

    const questions = await questionService.getQuestionsByType(
      type,
      parseInt(limit) || 20
    );

    if (!questions) {
      return res
        .status(400)
        .json(
          ApiResponse.error('Invalid type. Use newest | trending | unanswer')
        );
    }

    return res.json(
      ApiResponse.success(`Get questions by type: ${type}`, questions)
    );
  } catch (err) {
    return res
      .status(500)
      .json(ApiResponse.error('Internal server error', err.message));
  }
}

async function getQuestionDetail(req, res) {
  try {
    const { id } = req.params;
    const question = await questionService.getQuestionDetail(id);

    if (!question) {
      return res
        .status(400)
        .json(
          ApiResponse.error(
            'Question not found, failure rasied at Question.controller'
          )
        );
    }

    return res.json(
      ApiResponse.success('Get question detail successfully', question)
    );
  } catch (err) {
    return res
      .status(500)
      .json(
        ApiResponse.error(
          'Internal server error, failure rasied at Question.controller',
          err.message
        )
      );
  }
}

async function createQuestion(req, res) {
  try {
    const { title, content, tags } = req.body;

    if (!title || !content) {
      return res
        .status(400)
        .json(ApiResponse.error('Required fields are missing'));
    }

    const userId = req.userId;

    const question = await Question.create({
      title,
      content,
      tags,
      user: userId,
    });

    return res
      .status(201)
      .json(ApiResponse.success('Create question successfully', question));
  } catch (err) {
    console.error('Error in createQuestion:', err);
    return res
      .status(500)
      .json(
        ApiResponse.error(
          'Internal server error, failure raised at Question.controller',
          err.message
        )
      );
  }
}

async function editQuestion(req, res) {
  const { questionId } = req.params;
  const { title, content, tags } = req.body;

  try {
    const updatedQuestion = await questionService.updateQuestion(questionId, {
      title,
      content,
      tags,
    });
    return res.json(ApiResponse.success('Question updated', updatedQuestion));
  } catch (error) {
    console.error('Error editing question:', error);
    return res
      .status(400)
      .json(ApiResponse.error(error.message || 'Failed to update question'));
  }
}

async function getUserQuestions(req, res) {
  try {
    const { userId } = req.params;
    const userQuestions = await questionService.getUserQuestions(userId);

    if (!userQuestions) {
      return res
        .status(400)
        .json(
          ApiResponse.error(
            'User questions not found, failure raised at Question.controller'
          )
        );
    }

    return res.json(
      ApiResponse.success('Get user questions successfully', userQuestions)
    );
  } catch (err) {
    return res
      .status(500)
      .json(
        ApiResponse.error(
          'Internal server error, failure raised at Question.controller',
          err.message
        )
      );
  }
}

module.exports = {
  getQuestions,
  getQuestionDetail,
  createQuestion,
  editQuestion,
  getUserQuestions,
};
