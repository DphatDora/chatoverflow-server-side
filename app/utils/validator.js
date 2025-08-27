
function isValidEmail(email) {
  if (!email || email.trim() === '') return { valid: false, error: "Email cannot be empty" };

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return { valid: false, error: "Email is not valid" };
  }

  return { valid: true };
}

function isValidPassword(password) {
  if (!password || password.trim() === '') {
    return { valid: false, error: "Password cannot be empty" };
  }
  if (password.length < 6) {
    return { valid: false, error: "Password must be at least 6 characters" };
  }
  if (password.length > 100) {
    return { valid: false, error: "Password cannot exceed 100 characters" };
  }
  return { valid: true };
}

module.exports = {
  isValidEmail,
  isValidPassword
};
