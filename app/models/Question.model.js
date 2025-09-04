const mongoose = require("mongoose");

const QuestionSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    content: { type: String, required: true },
    tags: [{ type: String, trim: true }],
    askedTime: { type: Date, default: Date.now },
    views: { type: Number, default: 0 },
    upvotedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    downvotedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

QuestionSchema.virtual("answerCount", {
  ref: "Answer",
  localField: "_id",
  foreignField: "question",
  count: true,
});
module.exports = mongoose.model("Question", QuestionSchema);
