const Question = require('../../models/Question.model');

const buildDateFilter = (dateRange) => {
  const now = new Date();
  let startDate;

  switch (dateRange) {
    case 'day':
      startDate = new Date(now.setDate(now.getDate() - 1));
      break;
    case 'week':
      startDate = new Date(now.setDate(now.getDate() - 7));
      break;
    case 'month':
      startDate = new Date(now.setMonth(now.getMonth() - 1));
      break;
    case 'year':
      startDate = new Date(now.setFullYear(now.getFullYear() - 1));
      break;
    default:
      return null;
  }

  return { $gte: startDate };
};
const getSearchCount = async (searchQuery) => {
  if (Object.keys(searchQuery).length === 0) {
    return await Question.countDocuments();
  }
  return await Question.countDocuments(searchQuery);
};

exports.searchQuestions = async ({
  query,
  filters = {},
  sortBy = 'relevance',
  page = 1,
  limit = 20,
}) => {
  try {
    let searchQuery = {};
    let sort = {};

    if (query && query.trim()) {
      searchQuery.$text = {
        $search: query,
        $caseSensitive: false,
      };
    }

    if (filters.dateRange) {
      const dateFilter = buildDateFilter(filters.dateRange);
      if (dateFilter) {
        searchQuery.askedTime = dateFilter;
      }
    }

    switch (sortBy) {
      case 'date':
        sort = { askedTime: -1 };
        break;
      case 'votes':
        sort = { upvoteCount: -1, askedTime: -1 };
        break;
      case 'views':
        sort = { views: -1, askedTime: -1 };
        break;
      case 'relevance':
      default:
        if (query && query.trim()) {
          sort = { score: { $meta: 'textScore' }, askedTime: -1 };
        } else {
          sort = { askedTime: -1 };
        }
        break;
    }

    /* Pagination */
    const skip = (page - 1) * limit;

    /* Aggregation pipeline */
    const pipeline = [
      ...(Object.keys(searchQuery).length > 0 ? [{ $match: searchQuery }] : []),
      {
        $addFields: {
          upvoteCount: { $size: '$upvotedBy' },
          downvoteCount: { $size: '$downvotedBy' },
          voteScore: {
            $subtract: [{ $size: '$upvotedBy' }, { $size: '$downvotedBy' }],
          },
        },
      },
      ...(query && query.trim() && sortBy === 'relevance'
        ? [{ $addFields: { score: { $meta: 'textScore' } } }]
        : []),
      { $sort: sort },
      { $skip: skip },
      { $limit: limit },
      {
        $lookup: {
          from: 'users',
          localField: 'user',
          foreignField: '_id',
          as: 'author',
          pipeline: [{ $project: { username: 1, avatar: 1, reputation: 1 } }],
        },
      },
      {
        $lookup: {
          from: 'answers',
          localField: '_id',
          foreignField: 'question',
          as: 'answers',
        },
      },
      {
        $addFields: {
          author: { $arrayElemAt: ['$author', 0] },
          answerCount: { $size: '$answers' },
        },
      },
      {
        $project: {
          answers: 0,
          upvotedBy: 0,
          downvotedBy: 0,
        },
      },
    ];

    const [results, totalCount] = await Promise.all([
      Question.aggregate(pipeline),
      getSearchCount(searchQuery),
    ]);

    return {
      results,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalCount / limit),
        totalResults: totalCount,
        hasNext: page * limit < totalCount,
        hasPrev: page > 1,
      },
    };
  } catch (error) {
    throw new Error(`Search failed: ${error.message}`);
  }
};

exports.getPopularTags = async (limit = 20) => {
  try {
    const tags = await Question.aggregate([
      { $unwind: '$tags' },
      { $group: { _id: '$tags', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: limit },
      { $project: { tag: '$_id', count: 1, _id: 0 } },
    ]);
    return tags;
  } catch (error) {
    throw new Error(`Failed to get popular tags: ${error.message}`);
  }
};
