const validator = require('../../utils/validator');

class ResetPasswordRequestDto {
  constructor(newPassword) {
    this.newPassword = newPassword;
  }

  static validate(data) {
    const { newPassword } = data;

    // Validate new password
    if (!newPassword || typeof newPassword !== 'string') {
      return {
        valid: false,
        message: 'Mật khẩu mới là bắt buộc',
      };
    }

    if (newPassword.trim().length < 6) {
      return {
        valid: false,
        message: 'Mật khẩu mới phải có ít nhất 6 ký tự',
      };
    }

    if (newPassword.trim().length > 100) {
      return {
        valid: false,
        message: 'Mật khẩu mới không được quá 100 ký tự',
      };
    }

    // Validate password strength
    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{6,}$/;
    if (!passwordRegex.test(newPassword.trim())) {
      return {
        valid: false,
        message:
          'Mật khẩu mới phải chứa ít nhất một chữ hoa, một chữ thường và một số',
      };
    }

    return { valid: true };
  }

  static sanitize(data) {
    const { newPassword } = data;

    return {
      newPassword: newPassword ? newPassword.trim() : '',
    };
  }
}

module.exports = ResetPasswordRequestDto;
