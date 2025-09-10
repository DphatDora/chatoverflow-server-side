const User = require("../models/User.model");
const RefreshToken = require("../models/RefreshToken.model");

exports.findUserByEmail = async (email, withPassword = false) => {
  if (withPassword) return User.findOne({ email }).select("+password");
  return User.findOne({ email });
};

exports.findUserById = async (userId) => {
  return User.findById(userId);
};

exports.createRefreshToken = async (userId, token, expiresAt) => {
  const refreshToken = new RefreshToken({
    userId,
    token,
    expiresAt,
  });
  return await refreshToken.save();
};

exports.findRefreshToken = async (token) => {
  return RefreshToken.findOne({
    token,
    isRevoked: false,
    expiresAt: { $gt: new Date() },
  }).populate("userId");
};

exports.revokeRefreshToken = async (token) => {
  return RefreshToken.updateOne({ token }, { isRevoked: true });
};

exports.revokeAllUserRefreshTokens = async (userId) => {
  return RefreshToken.updateMany({ userId }, { isRevoked: true });
};

exports.cleanExpiredTokens = async () => {
  return RefreshToken.deleteMany({
    $or: [{ expiresAt: { $lt: new Date() } }, { isRevoked: true }],
  });
};
