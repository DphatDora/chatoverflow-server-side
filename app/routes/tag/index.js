const express = require('express');
const router = express.Router();
const TagController = require('../../controller/topic/Tag.controller');
const auth = require('../../middleware/App.middleware');

/**
 * GET /api/tag?page=1 - Get popular tags with pagination
 * GET /api/tag?name=react - Search tags by name for autocomplete
 */
router.get('/', TagController.getTags);

/**
 * GET /api/tag/:tagName/questions?page=1&limit=20 - Get questions by tag ordered by popularity
 */
router.get('/:tagName/questions', TagController.getQuestionsByTag);

/**
 * POST /api/tag/sync - Sync tags from questions (Admin only)
 * This endpoint should be protected and called periodically
 */
router.post('/sync', auth, TagController.syncTags);

module.exports = router;
