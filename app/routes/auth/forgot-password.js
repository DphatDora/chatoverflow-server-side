const express = require('express');
const router = express.Router();
const forgotPasswordController = require('../../controller/auth/ForgotPassword.controller');

// PASSWORD RESET
router.post('/send-otp', forgotPasswordController.sendOTP);
router.post('/verify-otp', forgotPasswordController.verifyOTP);
router.get('/reset-password', forgotPasswordController.resetPassword);

module.exports = router;
