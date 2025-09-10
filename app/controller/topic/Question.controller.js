const questionService = require('../../services/topic/question.service');
const ApiResponse = require('../../dto/res/api.response');

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

module.exports = {
  getQuestions,
  getQuestionDetail,
};
