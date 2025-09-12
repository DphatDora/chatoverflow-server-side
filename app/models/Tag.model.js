const mongoose = require('mongoose');

const TagSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      index: true, // For fast search
    },
    displayName: {
      type: String,
      required: true,
      trim: true,
    },
    questionCount: {
      type: Number,
      default: 0,
      index: -1, // Descending index for popularity sorting
    },
    description: { type: String, default: 'this is example description' },
  },
  {
    timestamps: true,
  }
);

// Compound index for search and pagination
TagSchema.index({ name: 'text', displayName: 'text' });
TagSchema.index({ questionCount: -1, name: 1 });

// Update question count when tag is referenced
TagSchema.statics.incrementCount = async function (tagName) {
  return this.findOneAndUpdate(
    { name: tagName.toLowerCase() },
    {
      $inc: { questionCount: 1 },
      $setOnInsert: {
        name: tagName.toLowerCase(),
        displayName: tagName,
      },
    },
    {
      upsert: true,
      new: true,
    }
  );
};

TagSchema.statics.decrementCount = async function (tagName) {
  return this.findOneAndUpdate(
    { name: tagName.toLowerCase() },
    { $inc: { questionCount: -1 } },
    { new: true }
  );
};

module.exports = mongoose.model('Tag', TagSchema);
