const express = require('express');
const router = express.Router();
const searchController = require('../../controller/search/Search.controller');

// Main search endpoint
// GET /search?q=nodejs&type=all&sortBy=relevance&dateRange=week&tags=js,node&page=1&limit=20
router.get('/', searchController.search);

// Search suggestions for autocomplete
// GET /search/suggestions?q=node&limit=5
router.get('/suggestions', searchController.getSearchSuggestions);

// Get popular tags
// GET /search/popular-tags?limit=20
router.get('/popular-tags', searchController.getPopularTags);

module.exports = router;
