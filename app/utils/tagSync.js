const Question = require('../models/Question.model');
const Tag = require('../models/Tag.model');

/**
 * Sync tag counts with actual question data
 * Useful for cleanup after bulk operations or data inconsistencies
 */
const syncTagCounts = async () => {
  try {
    console.log('🔄 Starting tag synchronization...');

    // Reset all tag counts to 0
    await Tag.updateMany({}, { questionCount: 0 });

    // Get all unique tags from questions
    const tagCounts = await Question.aggregate([
      { $unwind: '$tags' },
      {
        $group: {
          _id: '$tags',
          count: { $sum: 1 },
        },
      },
    ]);

    // Update tag counts
    for (const tagData of tagCounts) {
      const tagName = tagData._id.trim().toLowerCase();
      const displayName = tagData._id.trim();

      await Tag.findOneAndUpdate(
        { name: tagName },
        {
          name: tagName,
          displayName: displayName,
          questionCount: tagData.count,
        },
        { upsert: true }
      );
    }

    // Remove tags with 0 questions (optional)
    await Tag.deleteMany({ questionCount: 0 });

    console.log(
      `✅ Tag synchronization complete! Updated ${tagCounts.length} tags.`
    );
    return tagCounts.length;
  } catch (error) {
    console.error('❌ Tag synchronization failed:', error.message);
    throw error;
  }
};

/**
 * Clean up orphaned tags (tags with 0 question count)
 */
const cleanupOrphanedTags = async () => {
  try {
    const result = await Tag.deleteMany({ questionCount: { $lte: 0 } });
    console.log(`🧹 Cleaned up ${result.deletedCount} orphaned tags`);
    return result.deletedCount;
  } catch (error) {
    console.error('❌ Tag cleanup failed:', error.message);
    throw error;
  }
};

module.exports = {
  syncTagCounts,
  cleanupOrphanedTags,
};
