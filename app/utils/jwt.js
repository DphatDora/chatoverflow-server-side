const jwt = require("jsonwebtoken");

function signUserId(userId) {
  const secret = process.env.JWT_SECRET;
  const expiresIn = process.env.JWT_EXPIRES || "7d";

  return jwt.sign({ sub: String(userId) }, secret, { expiresIn });
}

module.exports = { signUserId };
