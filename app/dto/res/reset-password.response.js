class ResetPasswordResponseDto {
  constructor(success, message, timestamp) {
    this.success = success;
    this.message = message;
    this.timestamp = timestamp || new Date().toISOString();
  }

  static success(message = 'Đổi mật khẩu thành công') {
    return new ResetPasswordResponseDto(true, message);
  }

  static error(message = 'Đổi mật khẩu thất bại') {
    return new ResetPasswordResponseDto(false, message);
  }
}

module.exports = ResetPasswordResponseDto;
