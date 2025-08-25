const express = require('express');
const router = express.Router();
const signupController = require('../../controller/auth/Signup.controller');
// AUTH (signup + login + verify)
router.post('/', signupController.initiateSignup);
router.post('/verify-otp', signupController.verifyOTP);
router.get('/resend-otp', signupController.resendOTP);

module.exports = router;
