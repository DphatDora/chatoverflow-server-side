const userRepository = require("../../repository/auth.repository");
const { signAccessToken } = require("../../utils/jwt");

exports.refreshToken = async (refreshToken) => {
  const tokenDoc = await userRepository.findRefreshToken(refreshToken);

  if (!tokenDoc) {
    throw new Error("Invalid refresh token");
  }

  const user = tokenDoc.userId;

  const newAccessToken = signAccessToken(user._id);

  return newAccessToken;
};
