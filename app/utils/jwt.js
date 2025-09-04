const jwt = require("jsonwebtoken");
const crypto = require("crypto");

const JWT_ACCESS_SECRET = process.env.JWT_ACCESS_SECRET;
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;
const ACCESS_TOKEN_EXPIRES = process.env.ACCESS_TOKEN_EXPIRES;
const REFRESH_TOKEN_EXPIRES = process.env.REFRESH_TOKEN_EXPIRES;

exports.signAccessToken = (userId, payload = {}) => {
  return jwt.sign(
    {
      userId,
      type: "access",
      ...payload,
    },
    JWT_ACCESS_SECRET,
    { expiresIn: ACCESS_TOKEN_EXPIRES }
  );
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
  const days = parseInt(REFRESH_TOKEN_EXPIRES.replace("d", ""));
  return new Date(Date.now() + days * 24 * 60 * 60 * 1000);
};
