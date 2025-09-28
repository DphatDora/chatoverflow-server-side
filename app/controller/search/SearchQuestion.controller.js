const searchService = require('../../services/search/SearchQuestion.service');

exports.searchQuestions = async (req, res) => {
  try {
    const searchParams = {
      query: req.query.q || req.query.query || '',
      type: req.query.type || 'all',
      sortBy: req.query.sortBy || 'relevance',
      dateRange: req.query.dateRange || 'all',
      tags: req.query.tags
        ? Array.isArray(req.query.tags)
          ? req.query.tags
          : req.query.tags.split(',')
        : [],
      page: req.query.page || 1,
      limit: req.query.limit || 20,
      minVotes: req.query.minVotes,
    };

    const result = await searchService.searchQuestions(searchParams);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        error: result.error,
      });
    }

    res.json(result);
  } catch (error) {
    console.error('Search controller error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
};

exports.getSearchSuggestions = async (req, res) => {
  try {
    const { q: query, limit } = req.query;

    const result = await searchService.getSearchSuggestions(query, limit);

    res.json(result);
  } catch (error) {
    console.error('Search suggestions controller error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
};

exports.getPopularTags = async (req, res) => {
  try {
    const result = await searchService.getPopularTags();
    res.json(result);
  } catch (error) {
    console.error('Popular tags controller error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
};
