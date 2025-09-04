const jwt = require("jsonwebtoken");
const crypto = require("crypto");

const JWT_ACCESS_SECRET = process.env.JWT_ACCESS_SECRET;
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;
const ACCESS_TOKEN_EXPIRES = parseInt(process.env.ACCESS_TOKEN_EXPIRES, 10);
const REFRESH_TOKEN_EXPIRES = parseInt(process.env.REFRESH_TOKEN_EXPIRES, 10);

exports.signAccessToken = (userId) => {
  return jwt.sign({ sub: String(userId) }, JWT_ACCESS_SECRET, {
    expiresIn: ACCESS_TOKEN_EXPIRES * 60,
  });
};

exports.generateRefreshToken = () => {
  return crypto.randomBytes(64).toString("hex");
};

// Verify Access Token
exports.verifyAccessToken = (token) => {
  try {
    return jwt.verify(token, JWT_ACCESS_SECRET);
  } catch (error) {
    throw new Error("Invalid access token");
  }
};

exports.getRefreshTokenExpiry = () => {
  return new Date(Date.now() + REFRESH_TOKEN_EXPIRES * 60 * 1000);
};
