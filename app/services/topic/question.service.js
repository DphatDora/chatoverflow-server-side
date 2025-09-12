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

module.exports = {
  getQuestionsByType,
  getQuestionDetail,
  createQuestion,
  updateQuestion,
};
