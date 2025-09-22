const replyRepo = require('../../repository/reply.repository');

class ReplyService {
  async createReply({ content, answerId, parentId, userId }) {
    const answer = await replyRepo.findAnswerById(answerId);
    if (!answer) throw new Error('Answer not found');

    if (parentId) {
      const parent = await replyRepo.findReplyById(parentId);
      if (!parent) throw new Error('Parent reply not found');
    }

    const reply = await replyRepo.create({
      content,
      answer: answerId,
      parent: parentId || null,
      user: userId,
    });

    // Populate user data before returning
    return replyRepo.findReplyByIdWithUser(reply._id);
  }

  async getRepliesByAnswer(answerId, parentId = null, page = 1, limit = 10) {
    const filter = { answer: answerId, parent: parentId };
    const skip = (page - 1) * limit;

    // lấy replies theo page
    const replies = await replyRepo.findReplies(filter, skip, limit);

    // đếm tổng số replies cho filter hiện tại
    const totalItems = await replyRepo.countReplies(filter);

    // ✅ với mỗi reply, kiểm tra số child
    const enrichedReplies = await Promise.all(
      replies.map(async (reply) => {
        const totalChildren = await replyRepo.countReplies({
          answer: answerId,
          parent: reply._id,
        });

        return {
          ...reply,
          totalChildren,
          hasMoreChildren: totalChildren > 0, // FE sẽ biết có child để load
        };
      })
    );

    return {
      replies: enrichedReplies,
      totalItems,
      hasMore: skip + replies.length < totalItems,
    };
  }

  buildNestedStructure(replies) {
    const map = {};
    replies.forEach((r) => (map[r._id] = { ...r, children: [] }));

    const roots = [];
    replies.forEach((r) => {
      if (r.parent) {
        if (map[r.parent]) {
          map[r.parent].children.push(map[r._id]);
        } else {
          roots.push(map[r._id]);
        }
      } else {
        roots.push(map[r._id]);
      }
    });

    return roots;
  }

  async upvoteReply(replyId, userId) {
    const reply = await replyRepo.findReplyById(replyId);
    if (!reply) throw new Error('Reply not found');

    const hasUpvoted = reply.upvotedBy.includes(userId);
    const hasDownvoted = reply.downvotedBy.includes(userId);

    if (hasUpvoted) {
      // Remove upvote
      await replyRepo.removeUpvote(replyId, userId);
      return { message: 'Upvote removed', data: { action: 'removed' } };
    } else {
      // Add upvote and remove downvote if exists
      if (hasDownvoted) {
        await replyRepo.removeDownvote(replyId, userId);
      }
      await replyRepo.addUpvote(replyId, userId);
      return { message: 'Reply upvoted', data: { action: 'added' } };
    }
  }

  async downvoteReply(replyId, userId) {
    const reply = await replyRepo.findReplyById(replyId);
    if (!reply) throw new Error('Reply not found');

    const hasUpvoted = reply.upvotedBy.includes(userId);
    const hasDownvoted = reply.downvotedBy.includes(userId);

    if (hasDownvoted) {
      // Remove downvote
      await replyRepo.removeDownvote(replyId, userId);
      return { message: 'Downvote removed', data: { action: 'removed' } };
    } else {
      // Add downvote and remove upvote if exists
      if (hasUpvoted) {
        await replyRepo.removeUpvote(replyId, userId);
      }
      await replyRepo.addDownvote(replyId, userId);
      return { message: 'Reply downvoted', data: { action: 'added' } };
    }
  }

  async getVoteStatus(replyId, userId) {
    const reply = await replyRepo.findReplyById(replyId);
    if (!reply) throw new Error('Reply not found');

    return {
      upvoted: reply.upvotedBy.includes(userId),
      downvoted: reply.downvotedBy.includes(userId),
    };
  }

  async editReply(replyId, content, userId) {
    const reply = await replyRepo.findReplyById(replyId);
    if (!reply) throw new Error('Reply not found');

    if (reply.user.toString() !== userId) {
      throw new Error('Not authorized to edit this reply');
    }

    const updatedReply = await replyRepo.updateReply(replyId, { content });
    return replyRepo.findReplyByIdWithUser(updatedReply._id);
  }

  async deleteReply(replyId, userId) {
    const reply = await replyRepo.findReplyById(replyId);
    if (!reply) throw new Error('Reply not found');

    if (reply.user.toString() !== userId) {
      throw new Error('Not authorized to delete this reply');
    }

    // Also delete all child replies
    await replyRepo.deleteReplyAndChildren(replyId);
  }

  async checkOwnership(replyId, userId) {
    const reply = await replyRepo.findReplyById(replyId);
    if (!reply) throw new Error('Reply not found');

    return reply.user.toString() === userId;
  }
}

module.exports = new ReplyService();
