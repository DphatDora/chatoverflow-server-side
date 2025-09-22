const express = require('express');
const router = express.Router();
const authMiddleware = require('../../middleware/App.middleware');
const answerController = require('../../controller/topic/Answer.controller');
const replyController = require('../../controller/topic/Reply.controller');

// Upvote Answer
router.post('/:answerId/upvote', authMiddleware, answerController.upvoteAnswer);

// Downvote Answer
router.post(
  '/:answerId/downvote',
  authMiddleware,
  answerController.downvoteAnswer
);

// Get Vote Status
router.get(
  '/:answerId/vote-status',
  authMiddleware,
  answerController.voteStatusAnswer
);

router.put('/:answerId/edit', authMiddleware, answerController.editAnswer);
router.delete(
  '/:answerId/delete',
  authMiddleware,
  answerController.deleteAnswer
);
router.get(
  '/:answerId/is-owner',
  authMiddleware,
  answerController.checkOwnership
);

// Reply routes for answers
// GET /api/answer/:answerId/replies?page=1&limit=10
router.get('/:answerId/replies', (req, res) =>
  replyController.getRepliesByAnswer(req, res)
);

// POST /api/answer/:answerId/replies
router.post('/:answerId/replies', authMiddleware, (req, res) =>
  replyController.createReplyToAnswer(req, res)
);

module.exports = router;
