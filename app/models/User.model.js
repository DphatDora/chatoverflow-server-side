const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const AddressSchema = new mongoose.Schema(
  {
    province: { type: String, maxlength: 100 },
    ward: { type: String, maxlength: 100 },
    street: { type: String, maxlength: 200 },
  },
  { _id: false }
);

const UserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    nickName: String,
    email: { type: String, required: true, unique: true },
    passwordHash: { type: String, required: false },
    avatar: String,
    dateOfBirth: { type: Date },
    address: AddressSchema,
    gender: {
      type: String,
      enum: ["male", "female", "other"],
      default: "other",
    },
    status: {
      type: String,
      enum: ["active", "inactive", "banned", "pending"], // thêm pending cho tài khoản chưa verify
      default: "pending", // mặc định là pending khi đăng ký
    },
    tempPasswordHash: String, // Temporary storage for signup process
  },
  { timestamps: true }
);

UserSchema.methods.comparePassword = function (plain) {
  return bcrypt.compare(plain, this.password);
};

module.exports = mongoose.model("User", UserSchema);
