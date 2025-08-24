const express = require('express');
const router = express.Router();
const forgotPasswordController = require('../../controller/auth/ForgotPassword.controller');

router.get('/', (req, res) => {
   // handle forgot password logic here, pleaseeeeeee
   res.send('Forgot Password route');
});
router.post('/send-otp', forgotPasswordController.sendOTP); // {"email": "user@example.com"}
router.post('/verify-otp', forgotPasswordController.verifyOTP); // {"email": "user@example.com", "otp": "123456"}
router.post('/reset-password', forgotPasswordController.resetPassword); // {"resetToken": "token", "newPassword": "newPassword"}

module.exports = router;
