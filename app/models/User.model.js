const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema(
   {
      name: { type: String, required: true },
      nickName: String,
      email: { type: String, required: true, unique: true },
      password: { type: String, required: false },     
      avatar: String,
      status: {
         type: String,
         enum: ["active", "inactive", "banned", "pending"], // thêm pending cho tài khoản chưa verify
         default: "pending" // mặc định là pending khi đăng ký
      },
      tempPasswordHash: String  // Temporary storage for signup process
   },
   { timestamps: true }
);

UserSchema.methods.comparePassword = function (plain) {
  return bcrypt.compare(plain, this.password);
};

module.exports = mongoose.model("User", UserSchema);
