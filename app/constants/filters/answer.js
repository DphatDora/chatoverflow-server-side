const ANSWER_SORT_OPTIONS = {
  HIGHEST_UPVOTES: 'highest_upvotes',
  NEWEST: 'newest',
  OLDEST: 'oldest',
  MOST_ACTIVE: 'most_active',
};

const DEFAULT_ANSWER_SORT = ANSWER_SORT_OPTIONS.NEWEST;

// Configuration for each sort type
const ANSWER_SORT_CONFIGS = {
  [ANSWER_SORT_OPTIONS.HIGHEST_UPVOTES]: {
    sortField: null, // Uses aggregation pipeline
    sortOrder: -1,
    requiresAggregation: true,
  },
  [ANSWER_SORT_OPTIONS.NEWEST]: {
    sortField: 'createdAt',
    sortOrder: -1,
    requiresAggregation: false,
  },
  [ANSWER_SORT_OPTIONS.OLDEST]: {
    sortField: 'createdAt',
    sortOrder: 1,
    requiresAggregation: false,
  },
  [ANSWER_SORT_OPTIONS.MOST_ACTIVE]: {
    sortField: 'updatedAt',
    sortOrder: -1,
    requiresAggregation: false,
  },
};

module.exports = {
  ANSWER_SORT_OPTIONS,
  DEFAULT_ANSWER_SORT,
  ANSWER_SORT_CONFIGS,
};
