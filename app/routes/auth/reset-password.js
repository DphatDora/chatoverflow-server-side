const express = require('express');
const router = express.Router();
const resetPasswordController = require('../../controller/auth/ResetPassword.controller');
const auth = require('../../middleware/App.middleware');

/**
 * @route PUT /auth/reset-password
 * @desc Reset user password with JWT authentication only
 * @access Private (requires JWT token)
 * @body { newPassword: string }
 */
router.put('/', auth, resetPasswordController.resetPassword);

module.exports = router;
