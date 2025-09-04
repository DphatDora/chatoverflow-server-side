const bcrypt = require("bcryptjs");
const userRepository = require("../../repository/auth.repository");

exports.logout = async (refreshToken) => {
  if (refreshToken) {
    await userRepository.revokeRefreshToken(refreshToken);
  }
  return { message: "Logged out successfully" };
};

exports.logoutAll = async (userId) => {
  await userRepository.revokeAllUserRefreshTokens(userId);
  return { message: "Logged out from all devices" };
};
