const express = require('express');
const router = express.Router();
const forgotPasswordController = require('../../controller/auth/ForgotPassword.controller');

// PASSWORD RESET
router.post('/', forgotPasswordController.requestOTP);
router.post('/reset-password', forgotPasswordController.resetPasswordWithOTP);

module.exports = router;
