const mongoose = require('mongoose');

const ReplySchema = new mongoose.Schema(
  {
    content: { type: String, required: true },
    answer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Answer',
      required: true,
    },
    parent: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Reply',
      default: null,
    },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    upvotedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    downvotedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  },
  { timestamps: true }
);

module.exports = mongoose.model('Reply', ReplySchema);
