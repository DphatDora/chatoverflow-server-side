// services/SearchService.js
const questionRepository = require('../../repository/search/SearchQuestion.repository');

/* 
Temporary put the helper functions here for testing with ease,
I will move them to a helper when it woking properly.
 */
const validateSearchParams = ({ page, limit, sortBy, dateRange }) => {
  if (page < 1 || page > 1000) {
    throw new Error('Invalid page number');
  }

  if (limit < 1 || limit > 100) {
    throw new Error('Invalid limit (1-100 allowed)');
  }

  const validSortBy = ['relevance', 'date', 'votes', 'views'];
  if (!validSortBy.includes(sortBy)) {
    throw new Error('Invalid sortBy parameter');
  }

  const validDateRanges = ['all', 'day', 'week', 'month', 'year'];
  if (!validDateRanges.includes(dateRange)) {
    throw new Error('Invalid dateRange parameter');
  }
};

const formatSearchResults = (results) => {
  return results.map((question) => ({
    id: question._id,
    title: question.title,
    description: truncateContent(question.content, 200),
    type: 'question',
    url: `/question/${question._id}`,
    metadata: {
      author: question.author?.username || 'Unknown',
      createdAt: formatDate(question.askedTime),
      tags: question.tags,
      votes: question.voteScore || 0,
      views: question.views || 0,
      answers: question.answerCount || 0,
    },
  }));
};

const truncateContent = (content, maxLength) => {
  if (!content || content.length <= maxLength) return content;
  return content.substring(0, maxLength).trim() + '...';
};

const formatDate = (date) => {
  if (!date) return '';
  const now = new Date();
  const questionDate = new Date(date);
  const diffTime = Math.abs(now - questionDate);
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
  if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
  return `${Math.floor(diffDays / 365)} years ago`;
};

/* Service Functions */
exports.searchQuestions = async (searchParams) => {
  try {
    const {
      query = '',
      type = 'all',
      sortBy = 'relevance',
      dateRange = 'all',
      tags = [],
      page = 1,
      limit = 20,
      minVotes = undefined,
    } = searchParams;

    /* Validate */
    validateSearchParams({ page, limit, sortBy, dateRange });

    /* Build filters */
    const filters = {};
    if (tags && tags.length > 0) {
      filters.tags = Array.isArray(tags) ? tags : [tags];
    }
    if (dateRange && dateRange !== 'all') {
      filters.dateRange = dateRange;
    }
    if (minVotes !== undefined && minVotes > 0) {
      filters.minVotes = parseInt(minVotes);
    }

    /* Perform search */
    const searchResults = await questionRepository.searchQuestions({
      query: query.trim(),
      filters,
      sortBy,
      page: parseInt(page),
      limit: parseInt(limit),
    });

    return {
      success: true,
      data: {
        results: formatSearchResults(searchResults.results),
        pagination: searchResults.pagination,
        searchQuery: query,
        appliedFilters: { type, sortBy, dateRange, tags },
      },
    };
  } catch (error) {
    console.error('Search service error:', error);
    return {
      success: false,
      error: error.message || 'Search failed',
    };
  }
};

exports.getSearchSuggestions = async (query, limit = 5) => {
  try {
    if (!query || query.trim().length < 2) {
      return { success: true, data: [] };
    }

    const suggestions = await questionRepository.searchQuestions({
      query: query.trim(),
      sortBy: 'relevance',
      page: 1,
      limit,
    });

    const formattedSuggestions = suggestions.results.map((question) => ({
      id: question._id,
      title: question.title,
      type: 'question',
      url: `/questions/${question._id}`,
    }));

    return {
      success: true,
      data: formattedSuggestions,
    };
  } catch (error) {
    console.error('Search suggestions error:', error);
    return {
      success: false,
      error: 'Failed to get suggestions',
    };
  }
};

exports.getPopularTags = async () => {
  try {
    const tags = await questionRepository.getPopularTags();
    return {
      success: true,
      data: tags,
    };
  } catch (error) {
    console.error('Popular tags error:', error);
    return {
      success: false,
      error: 'Failed to get popular tags',
    };
  }
};
