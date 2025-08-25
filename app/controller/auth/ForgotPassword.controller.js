const forgotPasswordService = require('../../services/auth/ForgotPassword.Service');


exports.sendOTP = async (req, res) => {
    const { email } = req.body;
    const result = await forgotPasswordService.sendResetOTP(email);
    res.status(result.success ? 200 : 400).json(result);
};

exports.verifyOTP = async (req, res) => {
    const { email, otp } = req.body;
    const result = await forgotPasswordService.verifyOTP(email, otp);
    res.status(result.success ? 200 : 400).json(result);
};

exports.resetPassword = async (req, res) => {
    const { resetToken, newPassword } = req.body;
    const result = await forgotPasswordService.resetPassword(resetToken, newPassword);
    res.status(result.success ? 200 : 400).json(result);
};
