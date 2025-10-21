const BLOG_SORT_OPTIONS = {
  NEWEST: 'newest',
  OLDEST: 'oldest',
  LAST_7_DAYS: 'last_7_days',
  HIGHEST_VOTES: 'highest_votes',
  LOWEST_VOTES: 'lowest_votes',
};

const DEFAULT_BLOG_SORT = BLOG_SORT_OPTIONS.NEWEST;

const BLOG_SORT_CONFIGS = {
  [BLOG_SORT_OPTIONS.NEWEST]: {
    sortField: 'createdAt',
    sortOrder: -1,
  },
  [BLOG_SORT_OPTIONS.OLDEST]: {
    sortField: 'createdAt',
    sortOrder: 1,
  },
  [BLOG_SORT_OPTIONS.LAST_7_DAYS]: {
    sortField: 'createdAt',
    sortOrder: -1,
    dateFilter: true,
  },
  [BLOG_SORT_OPTIONS.HIGHEST_VOTES]: {
    sortField: 'voteScore',
    sortOrder: -1,
    requiresAggregation: true,
  },
  [BLOG_SORT_OPTIONS.LOWEST_VOTES]: {
    sortField: 'voteScore',
    sortOrder: 1,
    requiresAggregation: true,
  },
};

module.exports = {
  BLOG_SORT_OPTIONS,
  DEFAULT_BLOG_SORT,
  BLOG_SORT_CONFIGS,
};
