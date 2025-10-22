const searchRepository = require('../../repository/search/Search.repository');

/**
 * Validate search parameters
 */
const validateSearchParams = ({ page, limit, sortBy, dateRange, type }) => {
  if (page < 1 || page > 1000) {
    throw new Error('Page must be between 1 and 1000');
  }

  if (limit < 1 || limit > 100) {
    throw new Error('Limit must be between 1 and 100');
  }

  const validSortBy = ['relevance', 'date', 'votes'];
  if (!validSortBy.includes(sortBy)) {
    throw new Error('sortBy must be one of: relevance, date, votes');
  }

  const validDateRanges = ['all', 'day', 'week', 'month', 'year'];
  if (!validDateRanges.includes(dateRange)) {
    throw new Error('dateRange must be one of: all, day, week, month, year');
  }

  const validTypes = ['all', 'question', 'blog'];
  if (!validTypes.includes(type)) {
    throw new Error('type must be one of: all, question, blog');
  }
};

/**
 * Format date for display
 */
const formatDate = (date) => {
  if (!date) return '';
  const now = new Date();
  const targetDate = new Date(date);
  const diffTime = Math.abs(now - targetDate);
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
  if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
  return `${Math.floor(diffDays / 365)} years ago`;
};

/**
 * Truncate content with ellipsis
 */
const truncateContent = (content, maxLength = 200) => {
  if (!content || content.length <= maxLength) return content;
  return content.substring(0, maxLength).trim() + '...';
};

/**
 * Format question result
 */
const formatQuestionResult = (question) => ({
  id: question._id,
  title: question.title,
  description: truncateContent(question.content, 200),
  type: 'question',
  url: `/question/${question._id}`,
  metadata: {
    author: question.author?.username || 'Unknown',
    authorAvatar: question.author?.avatar,
    authorReputation: question.author?.reputation,
    createdAt: question.askedTime || question.createdAt,
    formattedDate: formatDate(question.askedTime || question.createdAt),
    tags: question.tags || [],
    votes: question.voteScore || 0,
    views: question.views || 0,
    answers: question.answerCount || 0,
  },
});

/**
 * Format blog result
 */
const formatBlogResult = (blog) => ({
  id: blog._id,
  title: blog.title,
  description: truncateContent(blog.content, 200),
  type: 'blog',
  url: `/blogs/${blog._id}`,
  metadata: {
    author: blog.author?.username || 'Unknown',
    authorAvatar: blog.author?.avatar,
    authorReputation: blog.author?.reputation,
    createdAt: blog.createdAt,
    formattedDate: formatDate(blog.createdAt),
    tags: blog.tags || [],
    votes: blog.voteScore || 0,
    views: blog.views || 0,
  },
});

/**
 * Build pagination object
 */
const buildPagination = (page, limit, totalCount) => ({
  currentPage: page,
  totalPages: Math.ceil(totalCount / limit),
  totalResults: totalCount,
  hasNext: page * limit < totalCount,
  hasPrev: page > 1,
});

/**
 * Main search function - searches Questions and/or Blogs
 */
exports.search = async (searchParams) => {
  try {
    const {
      query = '',
      type = 'all',
      sortBy = 'relevance',
      dateRange = 'all',
      tags = [],
      page = 1,
      limit = 20,
      minVotes = 0,
    } = searchParams;

    // Validate parameters
    validateSearchParams({ page, limit, sortBy, dateRange, type });

    // Parse and normalize inputs
    const parsedPage = parseInt(page);
    const parsedLimit = parseInt(limit);
    const parsedMinVotes = parseInt(minVotes) || 0;
    const normalizedTags = Array.isArray(tags) ? tags : tags ? [tags] : [];

    // Build filters
    const filters = {
      dateRange: dateRange !== 'all' ? dateRange : null,
      tags: normalizedTags,
      minVotes: parsedMinVotes,
    };

    // Search based on type
    let questionResults = null;
    let blogResults = null;

    if (type === 'all' || type === 'question') {
      questionResults = await searchRepository.searchQuestions({
        query: query.trim(),
        filters,
        sortBy,
        page: parsedPage,
        limit: parsedLimit,
      });
    }

    if (type === 'all' || type === 'blog') {
      blogResults = await searchRepository.searchBlogs({
        query: query.trim(),
        filters,
        sortBy,
        page: parsedPage,
        limit: parsedLimit,
      });
    }

    // Format and merge results
    let results = [];
    let totalCount = 0;

    if (type === 'all') {
      // Merge and interleave results from both sources
      const questions = questionResults.results.map(formatQuestionResult);
      const blogs = blogResults.results.map(formatBlogResult);

      // Simple merge strategy: interleave based on score/date
      results = [...questions, ...blogs]
        .sort((a, b) => {
          if (sortBy === 'votes') {
            return b.metadata.votes - a.metadata.votes;
          }
          if (sortBy === 'date') {
            return (
              new Date(b.metadata.createdAt) - new Date(a.metadata.createdAt)
            );
          }
          // For relevance, maintain order from individual searches
          return 0;
        })
        .slice(0, parsedLimit);

      totalCount = questionResults.totalCount + blogResults.totalCount;
    } else if (type === 'question') {
      results = questionResults.results.map(formatQuestionResult);
      totalCount = questionResults.totalCount;
    } else if (type === 'blog') {
      results = blogResults.results.map(formatBlogResult);
      totalCount = blogResults.totalCount;
    }

    return {
      success: true,
      data: {
        results,
        pagination: buildPagination(parsedPage, parsedLimit, totalCount),
        query: query.trim(),
        filters: { type, sortBy, dateRange, tags: normalizedTags },
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

/**
 * Get search suggestions (typeahead)
 */
exports.getSearchSuggestions = async (query, limit = 5) => {
  try {
    if (!query || query.trim().length < 2) {
      return { success: true, data: [] };
    }

    const parsedLimit = Math.min(parseInt(limit) || 5, 10);

    // Search both questions and blogs for suggestions
    const [questionResults, blogResults] = await Promise.all([
      searchRepository.searchQuestions({
        query: query.trim(),
        filters: {},
        sortBy: 'relevance',
        page: 1,
        limit: Math.ceil(parsedLimit / 2),
      }),
      searchRepository.searchBlogs({
        query: query.trim(),
        filters: {},
        sortBy: 'relevance',
        page: 1,
        limit: Math.ceil(parsedLimit / 2),
      }),
    ]);

    // Format suggestions
    const questionSuggestions = questionResults.results.map((q) => ({
      id: q._id,
      title: q.title,
      type: 'question',
      url: `/questions/${q._id}`,
    }));

    const blogSuggestions = blogResults.results.map((b) => ({
      id: b._id,
      title: b.title,
      type: 'blog',
      url: `/blogs/${b._id}`,
    }));

    // Interleave and limit
    const suggestions = [];
    const maxLength = Math.max(
      questionSuggestions.length,
      blogSuggestions.length
    );

    for (let i = 0; i < maxLength && suggestions.length < parsedLimit; i++) {
      if (i < questionSuggestions.length) {
        suggestions.push(questionSuggestions[i]);
      }
      if (suggestions.length < parsedLimit && i < blogSuggestions.length) {
        suggestions.push(blogSuggestions[i]);
      }
    }

    return {
      success: true,
      data: suggestions.slice(0, parsedLimit),
    };
  } catch (error) {
    console.error('Search suggestions error:', error);
    return {
      success: false,
      error: 'Failed to get suggestions',
    };
  }
};

/**
 * Get popular tags from both Questions and Blogs
 */
exports.getPopularTags = async (limit = 20) => {
  try {
    const parsedLimit = Math.min(parseInt(limit) || 20, 50);
    const tags = await searchRepository.getPopularTags(parsedLimit);

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
