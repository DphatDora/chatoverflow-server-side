const mongoose = require('mongoose');
const slugify = require('slugify');

const BlogSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    slug: { type: String, unique: true, index: true },

    content_html: { type: String, required: true },
    summary: { type: String },
    coverImage: { type: String },

    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

    upvotedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    downvotedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],

    tags: [{ type: String }],
    isPublished: { type: Boolean, default: true },
  },
  { timestamps: true }
);

BlogSchema.index(
  {
    title: 'text',
    content_html: 'text',
    summary: 'text',
    tags: 'text',
  },
  {
    weights: {
      title: 10,
      summary: 7,
      content_html: 5,
      tags: 3,
    },
  }
);

BlogSchema.pre('save', function (next) {
  if (this.isModified('title') || this.isNew) {
    this.slug = slugify(this.title, { lower: true, strict: true });
  }
  next();
});

BlogSchema.pre('findOneAndUpdate', function (next) {
  const update = this.getUpdate();
  if (update.title) {
    update.slug = slugify(update.title, { lower: true, strict: true });
    this.setUpdate(update);
  }
  next();
});

module.exports = mongoose.model('Blog', BlogSchema);
