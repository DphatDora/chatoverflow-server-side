const mongoose = require('mongoose');

const BlogCommentSchema = new mongoose.Schema(
  {
    content: { type: String, required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    blog: { type: mongoose.Schema.Types.ObjectId, ref: 'Blog', required: true },

    upvotedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    downvotedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],

    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

BlogCommentSchema.index({ blog: 1, createdAt: -1 });
BlogCommentSchema.index({ user: 1 });

module.exports = mongoose.model('BlogComment', BlogCommentSchema);
