const replyService = require('../../services/topic/Reply.service');
const ApiResponse = require('../../dto/res/api.response');
const {
  ReplyRequest,
  ReplyEditRequest,
} = require('../../dto/req/reply.request');
const {
  ReplyResponse,
  ReplyListResponse,
  VoteStatusResponse,
  OwnershipResponse,
} = require('../../dto/res/reply.response');

class ReplyController {
  async createReply(req, res) {
    try {
      const { content, answerId, parentId } = req.body;
      const userId = req.userId;

      // Validate request
      const replyRequest = new ReplyRequest(content, answerId, parentId);
      const validation = replyRequest.validate();

      if (!validation.isValid) {
        return res
          .status(400)
          .json(ApiResponse.error(validation.errors.join(', ')));
      }

      const sanitizedData = replyRequest.sanitize();

      const reply = await replyService.createReply({
        ...sanitizedData,
        userId,
      });

      return res
        .status(201)
        .json(
          ApiResponse.success(
            'Reply created successfully',
            ReplyResponse.fromReply(reply)
          )
        );
    } catch (err) {
      return res.status(400).json(ApiResponse.error(err.message));
    }
  }

  // Alternative method for creating reply to answer (matches frontend API)
  async createReplyToAnswer(req, res) {
    try {
      const { content, parentId } = req.body;
      const { answerId } = req.params;
      const userId = req.userId;

      // Validate request
      const replyRequest = new ReplyRequest(content, answerId, parentId);
      const validation = replyRequest.validate();

      if (!validation.isValid) {
        return res
          .status(400)
          .json(ApiResponse.error(validation.errors.join(', ')));
      }

      const sanitizedData = replyRequest.sanitize();

      const reply = await replyService.createReply({
        ...sanitizedData,
        answerId,
        userId,
      });

      return res
        .status(201)
        .json(
          ApiResponse.success(
            'Reply created successfully',
            ReplyResponse.fromReply(reply)
          )
        );
    } catch (err) {
      return res.status(400).json(ApiResponse.error(err.message));
    }
  }

  async getRepliesByAnswer(req, res) {
    try {
      const { answerId } = req.params;
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const parentId = req.query.parentId || null;

      const result = await replyService.getRepliesByAnswer(
        answerId,
        parentId,
        page,
        limit
      );

      const response = ReplyListResponse.fromServiceResponse(
        result,
        page,
        limit
      );

      return res.json(
        ApiResponse.success('Replies fetched successfully', response)
      );
    } catch (err) {
      return res.status(500).json(ApiResponse.error(err.message));
    }
  }

  async upvoteReply(req, res) {
    try {
      const { replyId } = req.params;
      const userId = req.userId;

      const result = await replyService.upvoteReply(replyId, userId);
      return res.json(ApiResponse.success(result.message, result.data));
    } catch (err) {
      return res.status(400).json(ApiResponse.error(err.message));
    }
  }

  async downvoteReply(req, res) {
    try {
      const { replyId } = req.params;
      const userId = req.userId;

      const result = await replyService.downvoteReply(replyId, userId);
      return res.json(ApiResponse.success(result.message, result.data));
    } catch (err) {
      return res.status(400).json(ApiResponse.error(err.message));
    }
  }

  async getVoteStatus(req, res) {
    try {
      const { replyId } = req.params;
      const userId = req.userId;

      const voteStatus = await replyService.getVoteStatus(replyId, userId);
      return res.json(
        ApiResponse.success(
          'Vote status retrieved',
          VoteStatusResponse.fromVoteStatus(voteStatus)
        )
      );
    } catch (err) {
      return res.status(400).json(ApiResponse.error(err.message));
    }
  }

  async editReply(req, res) {
    try {
      const { replyId } = req.params;
      const { content } = req.body;
      const userId = req.userId;

      // Validate request
      const editRequest = new ReplyEditRequest(content);
      const validation = editRequest.validate();

      if (!validation.isValid) {
        return res
          .status(400)
          .json(ApiResponse.error(validation.errors.join(', ')));
      }

      const sanitizedData = editRequest.sanitize();

      const reply = await replyService.editReply(
        replyId,
        sanitizedData.content,
        userId
      );
      return res.json(
        ApiResponse.success(
          'Reply updated successfully',
          ReplyResponse.fromReply(reply)
        )
      );
    } catch (err) {
      return res.status(400).json(ApiResponse.error(err.message));
    }
  }

  async deleteReply(req, res) {
    try {
      const { replyId } = req.params;
      const userId = req.userId;

      await replyService.deleteReply(replyId, userId);
      return res.json(ApiResponse.success('Reply deleted successfully'));
    } catch (err) {
      return res.status(400).json(ApiResponse.error(err.message));
    }
  }

  async checkOwnership(req, res) {
    try {
      const { replyId } = req.params;
      const userId = req.userId;

      const isOwner = await replyService.checkOwnership(replyId, userId);
      return res.json(
        ApiResponse.success(
          'Ownership checked',
          OwnershipResponse.fromOwnership(isOwner)
        )
      );
    } catch (err) {
      return res.status(400).json(ApiResponse.error(err.message));
    }
  }
}

module.exports = new ReplyController();
