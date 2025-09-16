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
 * POST /api/tag/sync - Sync tags from questions (Admin only)
 * This endpoint should be protected and called periodically
 */
router.post('/sync', auth, TagController.syncTags);

module.exports = router;
