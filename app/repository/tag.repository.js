const Tag = require('../models/Tag.model');

const popularTag = async (skip, limit) => {
  return Tag.find()
    .sort({ questionCount: -1, name: 1 })
    .skip(skip)
    .limit(limit)
    .lean();
};

const nameTag = async (searchTerm, searchRegex, limit) => {
  return Tag.find({
    $or: [
      { name: { $regex: `^${searchTerm.trim()}`, $options: 'i' } }, // Starts with (priority)
      { displayName: { $regex: `^${searchTerm.trim()}`, $options: 'i' } }, // Starts with (priority)
      { name: searchRegex }, // Contains anywhere
      { displayName: searchRegex }, // Contains anywhere
    ],
  })
    .sort({ questionCount: -1, name: 1 })
    .limit(limit)
    .select('_id name displayName questionCount')
    .lean();
};

module.exports = {
  popularTag,
  nameTag,
};
