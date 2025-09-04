const bcrypt = require("bcryptjs");
const userRepository = require("../../repository/auth.repository");
const {
  signAccessToken,
  generateRefreshToken,
  getRefreshTokenExpiry,
} = require("../../utils/jwt");

exports.login = async ({ email, password }) => {
  const user = await userRepository.findUserByEmail(email, true);
  if (!user || !(await bcrypt.compare(password, user.password))) {
    throw new Error("Invalid credentials");
  }

  const accessToken = signAccessToken(user._id);

  const refreshToken = generateRefreshToken();
  const refreshTokenExpiry = getRefreshTokenExpiry();

  await userRepository.createRefreshToken(
    user._id,
    refreshToken,
    refreshTokenExpiry
  );

  return {
    user: user,
    accessToken,
    refreshToken,
  };
};
