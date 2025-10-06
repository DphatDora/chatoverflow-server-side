const mongoose = require('mongoose');

const conversationSchema = new mongoose.Schema(
  {
    participantIDs: {
      type: [String],
      required: true,
      validate: {
        validator: function (v) {
          return v && v.length >= 2; /* At least 2 participants */
        },
        message: 'A conversation must have at least 2 participants',
      },
    },
  },
  {
    timestamps: true,
  }
);

conversationSchema.index({ participantIDs: 1 });

const Conversation = mongoose.model('Conversation', conversationSchema);
module.exports = Conversation;
