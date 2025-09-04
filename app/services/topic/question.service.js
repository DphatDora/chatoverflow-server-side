const questionRepository = require("../../repository/question.repository");

async function getQuestionsByType(type) {
  switch (type) {
    case "newest":
      return questionRepository.getNewest();
    case "trending":
      return questionRepository.getTrending();
    case "unanswer":
      return questionRepository.getUnanswered();
    default:
      return null;
  }
}

module.exports = {
  getQuestionsByType,
};
