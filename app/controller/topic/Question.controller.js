const questionService = require("../../services/topic/question.service");
const ApiResponse = require("../../dto/res/api.response");

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
          ApiResponse.error("Invalid type. Use newest | trending | unanswer")
        );
    }

    return res.json(
      ApiResponse.success(`Get questions by type: ${type}`, questions)
    );
  } catch (err) {
    return res
      .status(500)
      .json(ApiResponse.error("Internal server error", err.message));
  }
}

module.exports = {
  getQuestions,
};
