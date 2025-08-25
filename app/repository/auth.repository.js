const User = require("../models/User.model");

exports.findUserByEmail = async (email, withPassword = false) => {
  if (withPassword) return User.findOne({ email }).select("+password");
  return User.findOne({ email });
};
