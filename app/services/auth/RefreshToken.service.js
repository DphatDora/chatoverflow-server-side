const userRepository = require("../../repository/auth.repository");
const {
  signAccessToken,
  generateRefreshToken,
  getRefreshTokenExpiry,
} = require("../../utils/jwt");

exports.refreshToken = async (refreshToken) => {
  const tokenDoc = await userRepository.findRefreshToken(refreshToken);

  if (!tokenDoc) {
    throw new Error("Invalid refresh token");
  }

  const user = tokenDoc.userId;

  const newAccessToken = signAccessToken(user._id);

  // Generate new refresh token
  const newRefreshToken = generateRefreshToken();
  const refreshTokenExpiry = getRefreshTokenExpiry();

  // Revoke old refresh token
  await userRepository.revokeRefreshToken(refreshToken);
  await userRepository.createRefreshToken(
    user._id,
    newRefreshToken,
    refreshTokenExpiry
  );

  return {
    accessToken: newAccessToken,
    refreshToken: newRefreshToken,
  };
};
