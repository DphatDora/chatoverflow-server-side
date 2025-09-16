const Tag = require('../models/Tag.model');

const popularTag = async (skip, limit) => {
  return Tag.find()
    .sort({ questionCount: -1, name: 1 })
    .skip(skip)
    .limit(limit)
    .lean();
};

const nameTag = async (searchTerm, searchRegex, skip, limit) => {
  const filter = {
    $or: [
      { name: { $regex: `^${searchTerm.trim()}`, $options: 'i' } },
      { displayName: { $regex: `^${searchTerm.trim()}`, $options: 'i' } },
      { name: searchRegex },
      { displayName: searchRegex },
    ],
  };

  const [items, totalCount] = await Promise.all([
    Tag.find(filter)
      .sort({ questionCount: -1, name: 1 })
      .skip(skip)
      .limit(limit)
      .select('_id name displayName questionCount description')
      .lean(),
    Tag.countDocuments(filter),
  ]);

  return { items, totalCount };
};

module.exports = {
  popularTag,
  nameTag,
};
