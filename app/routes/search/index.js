const express = require('express');
const router = express.Router();
const searchController = require('../../controller/search/SearchQuestion.controller');

router.get('/', searchController.searchQuestions);
router.get('/suggestions', searchController.getSearchSuggestions);
router.get('/popular-tags', searchController.getPopularTags);

module.exports = router;
