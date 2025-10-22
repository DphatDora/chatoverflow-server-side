const searchService = require('../../services/search/Search.service');

/**
 * Parse tags from query parameter
 */
const parseTags = (tagsParam) => {
  if (!tagsParam) return [];
  if (Array.isArray(tagsParam)) return tagsParam;
  return tagsParam
    .split(',')
    .map((tag) => tag.trim())
    .filter(Boolean);
};

/**
 * Main search endpoint
 * GET /search?q=...&type=all&sortBy=relevance&dateRange=all&tags=js,node&page=1&limit=20&minVotes=0
 */
exports.search = async (req, res) => {
  try {
    const searchParams = {
      query: req.query.q || req.query.query || '',
      type: req.query.type || 'all',
      sortBy: req.query.sortBy || 'relevance',
      dateRange: req.query.dateRange || 'all',
      tags: parseTags(req.query.tags),
      page: req.query.page || 1,
      limit: req.query.limit || 20,
      minVotes: req.query.minVotes || 0,
    };

    const result = await searchService.search(searchParams);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        error: result.error,
      });
    }

    return res.status(200).json(result);
  } catch (error) {
    console.error('Search controller error:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
};

/**
 * Search suggestions endpoint (typeahead/autocomplete)
 * GET /search/suggestions?q=...&limit=5
 */
exports.getSearchSuggestions = async (req, res) => {
  try {
    const query = req.query.q || req.query.query || '';
    const limit = req.query.limit || 5;

    const result = await searchService.getSearchSuggestions(query, limit);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        error: result.error,
      });
    }

    return res.status(200).json(result);
  } catch (error) {
    console.error('Search suggestions controller error:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
};

/**
 * Popular tags endpoint
 * GET /search/popular-tags?limit=20
 */
exports.getPopularTags = async (req, res) => {
  try {
    const limit = req.query.limit || 20;

    const result = await searchService.getPopularTags(limit);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        error: result.error,
      });
    }

    return res.status(200).json(result);
  } catch (error) {
    console.error('Popular tags controller error:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
};
