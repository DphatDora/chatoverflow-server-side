const forgotPasswordService = require("../../services/auth/ForgotPassword.service");
const OTPService = require("../../services/common/OTP.service");
const User = require("../../models/User.model");
const UserPasswordReset = require("../../models/User.PasswordReset.model");
const ApiResponse = require("../../dto/res/api.response");
const jwt = require("jsonwebtoken");
const  {isValidEmail}  = require("../../utils/validator");

exports.requestOTP = async (req, res) => {
  try {
    const { email } = req.body;

    const checkEmail = isValidEmail(email);
    if (!checkEmail.valid) {
      return res.status(200).json(ApiResponse.error(checkEmail.error));
    }

    const result = await OTPService.sendOTP(
      email,
      User,
      UserPasswordReset,
      "reset",
      {
        userQuery: { status: { $in: ["active", "inactive"] } },
        userNotFoundMessage: "Email not exist",
      }
    );

    if (!result.success) {
      return res.status(200).json(ApiResponse.error(result.message));
    }

    return res.status(200).json(ApiResponse.success("OTP has been sent", { email }));
  } catch (err) {
    return res.status(400).json(ApiResponse.error(err.message));
  }
};

exports.resetPasswordWithOTP = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;

    // Verify OTP
    const verifyResult = await OTPService.verifyOTP(email, otp, User, UserPasswordReset, {
      userQuery: { status: { $in: ['active', 'inactive'] } },
      maxAttempts: 5,
    });

    if (!verifyResult.success) {
      return res.status(200).json(ApiResponse.error(verifyResult.message));
    }

    // Reset password
    const resetResult = await forgotPasswordService.resetPasswordByUser(verifyResult.user, newPassword);

    if (!resetResult.success) {
      return res.status(200).json(ApiResponse.error(resetResult.message));
    }

    return res.status(200).json(ApiResponse.success(resetResult.message, resetResult.data));
  } catch (err) {
    console.error('Reset password error:', err);
    return res.status(500).json(ApiResponse.error('System Error'));
  }
};