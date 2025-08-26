const forgotPasswordService = require("../../services/auth/ForgotPassword.service");
const OTPService = require("../../services/common/OTP.service");
const User = require("../../models/User.model");
const UserPasswordReset = require("../../models/User.PasswordReset.model");
const ApiResponse = require("../../dto/res/api.response");
const jwt = require("jsonwebtoken");

exports.sendOTP = async (req, res) => {
  try {
    const { email } = req.body;

    const result = await OTPService.sendOTP(
      email,
      User,
      UserPasswordReset,
      "reset",
      {
        userQuery: { status: { $in: ["active", "inactive"] } },
        userNotFoundMessage: "Email không tồn tại",
      }
    );

    if (!result.success) {
      return res.status(400).json(ApiResponse.error(result.message));
    }

    return res.status(200).json(ApiResponse.success(result.message, { email }));
  } catch (error) {
    return res.status(400).json(ApiResponse.error(error.message));
  }
};

exports.verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    const result = await OTPService.verifyOTP(
      email,
      otp,
      User,
      UserPasswordReset,
      {
        userQuery: { status: { $in: ["active", "inactive"] } },
        maxAttempts: 5,
      }
    );

    if (!result.success) {
      return res.status(400).json(ApiResponse.error(result.message));
    }

    // Generate reset token
    const token = jwt.sign(
      { userId: result.user._id },
      process.env.JWT_SECRET,
      { expiresIn: "10m" }
    );

    return res
      .status(200)
      .json(
        ApiResponse.success("OTP xác thực thành công", { resetToken: token })
      );
  } catch (error) {
    return res.status(400).json(ApiResponse.error(error.message));
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const { resetToken, newPassword } = req.body;

    const result = await forgotPasswordService.resetPassword(
      resetToken,
      newPassword
    );

    return res
      .status(200)
      .json(ApiResponse.success(result.message, result.data));
  } catch (error) {
    return res.status(400).json(ApiResponse.error(error.message));
  }
};
