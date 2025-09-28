const express = require('express');
const router = express.Router();
const replyController = require('../../controller/topic/Reply.controller');
const authMiddleware = require('../../middleware/App.middleware');

// POST /replies
router.post('/', authMiddleware, (req, res) =>
  replyController.createReply(req, res)
);

// GET /reply/:answerId?page=1&limit=10
router.get('/:answerId', (req, res) =>
  replyController.getRepliesByAnswer(req, res)
);

// POST /reply/:replyId/upvote
router.post('/:replyId/upvote', authMiddleware, (req, res) =>
  replyController.upvoteReply(req, res)
);

// POST /reply/:replyId/downvote
router.post('/:replyId/downvote', authMiddleware, (req, res) =>
  replyController.downvoteReply(req, res)
);

// GET /reply/:replyId/vote-status
router.get('/:replyId/vote-status', authMiddleware, (req, res) =>
  replyController.getVoteStatus(req, res)
);

// PUT /reply/:replyId/edit
router.put('/:replyId/edit', authMiddleware, (req, res) =>
  replyController.editReply(req, res)
);

// DELETE /reply/:replyId/delete
router.delete('/:replyId/delete', authMiddleware, (req, res) =>
  replyController.deleteReply(req, res)
);

// GET /reply/:replyId/is-owner
router.get('/:replyId/is-owner', authMiddleware, (req, res) =>
  replyController.checkOwnership(req, res)
);

module.exports = router;
