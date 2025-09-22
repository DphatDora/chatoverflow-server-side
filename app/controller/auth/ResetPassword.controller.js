const ResetPasswordService = require('../../services/auth/ResetPassword.service');
const ResetPasswordRequestDto = require('../../dto/req/reset-password.request');
const ApiResponse = require('../../dto/res/api.response');

/**
 * Reset user password controller
 * Requires JWT authentication and old password validation
 */
const resetPassword = async (req, res) => {
  try {
    // Validate request body
    const validation = ResetPasswordRequestDto.validate(req.body);
    if (!validation.valid) {
      return res.status(400).json(ApiResponse.error(validation.message));
    }

    // Sanitize input data
    const sanitizedData = ResetPasswordRequestDto.sanitize(req.body);
    const { newPassword } = sanitizedData;

    // Get user ID from JWT middleware (req.userId set by auth middleware)
    const userId = req.userId;
    if (!userId) {
      return res
        .status(401)
        .json(ApiResponse.error('Phiên đăng nhập không hợp lệ'));
    }

    // Additional password strength validation
    const passwordValidation =
      ResetPasswordService.validatePasswordStrength(newPassword);
    if (!passwordValidation.valid) {
      return res
        .status(400)
        .json(ApiResponse.error(passwordValidation.message));
    }

    // Call service to reset password
    const result = await ResetPasswordService.resetPassword(
      userId,
      newPassword
    );

    if (!result.success) {
      // Return appropriate status code based on error type
      const statusCode = result.message.includes('không chính xác')
        ? 400
        : result.message.includes('không tìm thấy')
        ? 404
        : result.message.includes('không được phép')
        ? 403
        : 400;

      return res.status(statusCode).json(ApiResponse.error(result.message));
    }

    // Success response
    return res.status(200).json(
      ApiResponse.success(result.message, {
        timestamp: result.data.timestamp,
      })
    );
  } catch (error) {
    console.error('Reset password controller error:', error);
    return res
      .status(500)
      .json(ApiResponse.error('Lỗi hệ thống khi đổi mật khẩu'));
  }
};

module.exports = {
  resetPassword,
};
