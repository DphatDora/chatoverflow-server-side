const User = require('../../models/User.model');
const bcrypt = require('bcrypt');

class ResetPasswordService {
  /**
   * Reset user password without old password validation
   * @param {string} userId - User ID from JWT token
   * @param {string} newPassword - New password to set
   * @returns {Object} Service response
   */
  static async resetPassword(userId, newPassword) {
    try {
      // Validate input parameters
      if (!userId || !newPassword) {
        return {
          success: false,
          message: 'Thiếu thông tin bắt buộc',
        };
      }

      // Find user by ID
      const user = await User.findById(userId);
      if (!user) {
        return {
          success: false,
          message: 'Không tìm thấy người dùng',
        };
      }

      // Check if user account is active
      if (user.status !== 'active') {
        return {
          success: false,
          message: 'Tài khoản không được phép thực hiện thao tác này',
        };
      }

      // Hash new password
      const saltRounds = 12;
      const hashedNewPassword = await bcrypt.hash(newPassword, saltRounds);

      // Update password in database
      await User.findByIdAndUpdate(
        userId,
        { 
          $set: { 
            password: hashedNewPassword,
            updatedAt: new Date()
          }
        },
        { new: true }
      );

      return {
        success: true,
        message: 'Đổi mật khẩu thành công',
        data: {
          userId: user._id,
          timestamp: new Date().toISOString()
        }
      };

    } catch (error) {
      console.error('Reset password service error:', error);
      return {
        success: false,
        message: 'Lỗi hệ thống khi đổi mật khẩu',
      };
    }
  }

  /**
   * Validate password strength
   * @param {string} password - Password to validate
   * @returns {Object} Validation result
   */
  static validatePasswordStrength(password) {
    const minLength = 6;
    const maxLength = 100;
    
    if (!password || password.length < minLength) {
      return {
        valid: false,
        message: `Mật khẩu phải có ít nhất ${minLength} ký tự`,
      };
    }

    if (password.length > maxLength) {
      return {
        valid: false,
        message: `Mật khẩu không được quá ${maxLength} ký tự`,
      };
    }

    // Check for at least one uppercase, one lowercase, and one digit
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]+$/;
    if (!passwordRegex.test(password)) {
      return {
        valid: false,
        message: 'Mật khẩu phải chứa ít nhất một chữ hoa, một chữ thường và một số',
      };
    }

    return { valid: true };
  }
}

module.exports = ResetPasswordService;