
function isValidEmail(email) {
  if (!email || email.trim() === '') return { valid: false, error: "Email không được để trống" };

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return { valid: false, error: "Email không hợp lệ" };
  }

  return { valid: true };
}

function isValidPassword(password) {
  if (!password || password.trim() === '') {
    return { valid: false, error: "Mật khẩu không được để trống" };
  }
  if (password.length < 6) {
    return { valid: false, error: "Mật khẩu phải có ít nhất 6 ký tự" };
  }
  if (password.length > 100) {
    return { valid: false, error: "Mật khẩu không được vượt quá 100 ký tự" };
  }
  return { valid: true };
}

module.exports = {
  isValidEmail,
  isValidPassword
};
