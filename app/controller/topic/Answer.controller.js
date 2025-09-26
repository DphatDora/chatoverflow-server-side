const ApiResponse = require('../../dto/res/api.response');
const answerService = require('../../services/topic/Answer.service');
const {
  ANSWER_SORT_OPTIONS,
  DEFAULT_ANSWER_SORT,
} = require('../../constants/filters/answer');

class AnswerController {
  async getAnswers(req, res) {
    try {
      const { questionId } = req.params;
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const sortBy = req.query.sortBy || DEFAULT_ANSWER_SORT;

      // Validate sortBy parameter
      const validSortOptions = Object.values(ANSWER_SORT_OPTIONS);
      if (!validSortOptions.includes(sortBy)) {
        return res
          .status(400)
          .json(
            ApiResponse.error(
              `Invalid sortBy option. Valid options: ${validSortOptions.join(
                ', '
              )}`
            )
          );
      }

      const baseUrl = `${req.protocol}://${req.get('host')}${req.baseUrl}${
        req.path
      }`;

      const { answers, total } = await answerService.getAnswersByQuestion(
        questionId,
        page,
        limit,
        sortBy
      );

      return res.json(
        ApiResponse.withPagination(
          'Answers fetched successfully',
          answers,
          page,
          limit,
          baseUrl,
          total
        )
      );
    } catch (error) {
      console.error(error);
      return res.status(500).json(ApiResponse.error('Failed to fetch answers'));
    }
  }

  async getTotalAnswers(req, res) {
    try {
      const { questionId } = req.params;
      const total = await answerService.getTotalAnswersByQuestion(questionId);

      return res.json(
        ApiResponse.success('Total answers fetched successfully', { total })
      );
    } catch (error) {
      console.error(error);
      return res
        .status(500)
        .json(ApiResponse.error('Failed to fetch total answers'));
    }
  }

  async addAnswer(req, res) {
    try {
      const { questionId } = req.params;
      const userId = req.userId;
      const { content } = req.body;

      if (!content || content.trim() === '') {
        return res
          .status(400)
          .json(ApiResponse.error('Answer content cannot be empty'));
      }

      const answer = await answerService.addAnswer({
        questionId,
        userId,
        content,
      });

      res.json(ApiResponse.success('Answer added successfully', answer));
    } catch (err) {
      console.error(err);
      res.status(500).json(ApiResponse.error('Failed to add answer'));
    }
  }

  async upvoteAnswer(req, res) {
    try {
      const { answerId } = req.params;
      const userId = req.userId;

      const result = await answerService.upvoteAnswer(answerId, userId);
      return res.json(ApiResponse.success('Upvote successful', result));
    } catch (err) {
      console.error(err);
      return res.status(400).json(ApiResponse.error(err.message));
    }
  }

  async downvoteAnswer(req, res) {
    try {
      const { answerId } = req.params;
      const userId = req.userId;

      const result = await answerService.downvoteAnswer(answerId, userId);
      return res.json(ApiResponse.success('Downvote successful', result));
    } catch (err) {
      console.error(err);
      return res.status(400).json(ApiResponse.error(err.message));
    }
  }

  async voteStatusAnswer(req, res) {
    try {
      const { answerId } = req.params;
      const userId = req.userId;

      const result = await answerService.voteStatusAnswer(answerId, userId);
      return res.json(ApiResponse.success('Vote status fetched', result));
    } catch (err) {
      console.error(err);
      return res.status(400).json(ApiResponse.error(err.message));
    }
  }

  // Check ownership
  async checkOwnership(req, res) {
    try {
      const { answerId } = req.params;
      const userId = req.userId;

      const isOwner = await answerService.isAnswerOwner(answerId, userId);
      return res.json(ApiResponse.success('Ownership checked', { isOwner }));
    } catch (err) {
      console.error(err);
      return res.status(400).json(ApiResponse.error(err.message));
    }
  }

  // Edit answer
  async editAnswer(req, res) {
    try {
      const { answerId } = req.params;
      const userId = req.userId;
      const { content } = req.body;

      if (!content || content.trim() === '') {
        return res
          .status(400)
          .json(ApiResponse.error('Answer content cannot be empty'));
      }

      const isOwner = await answerService.isAnswerOwner(answerId, userId);
      if (!isOwner) {
        return res
          .status(403)
          .json(
            ApiResponse.error('You are not authorized to edit this answer')
          );
      }

      const updatedAnswer = await answerService.editAnswer(
        answerId,
        userId,
        content
      );
      return res.json(
        ApiResponse.success('Answer updated successfully', updatedAnswer)
      );
    } catch (err) {
      console.error(err);
      return res.status(400).json(ApiResponse.error(err.message));
    }
  }

  // Delete answer
  async deleteAnswer(req, res) {
    try {
      const { answerId } = req.params;
      const userId = req.userId;

      const isOwner = await answerService.isAnswerOwner(answerId, userId);
      if (!isOwner) {
        return res
          .status(403)
          .json(
            ApiResponse.error('You are not authorized to delete this answer')
          );
      }

      await answerService.deleteAnswer(answerId, userId);
      return res.json(ApiResponse.success('Answer deleted successfully'));
    } catch (err) {
      console.error(err);
      return res.status(400).json(ApiResponse.error(err.message));
    }
  }
}

module.exports = new AnswerController();
