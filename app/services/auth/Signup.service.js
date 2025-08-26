const bcrypt = require("bcrypt");
const User = require("../../models/User.model");
const UserVerification = require("../../models/User.PasswordReset.model");
const OTPService = require("../common/OTP.service");

async function initiateSignup(name, nickName, email, password) {
  try {
    // Check if email already exists in verified User collection
    const existingUser = await User.findOne({
      email,
      status: { $in: ["active", "inactive"] },
    });
    if (existingUser) {
      throw new Error("Email đã được đăng ký");
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Create or update temporary user (pending status)
    const tempUser = await User.findOneAndUpdate(
      { email },
      {
        name,
        nickName,
        email,
        status: "pending",
        tempPasswordHash: passwordHash,
      },
      { upsert: true, new: true }
    );

    // Send OTP email using new OTP service
    const emailResult = await OTPService.sendOTP(
      email,
      User,
      UserVerification,
      "signup",
      {
        userQuery: { status: "pending" },
        userNotFoundMessage: "Không tìm thấy yêu cầu đăng ký",
      }
    );

    if (!emailResult.success) {
      // Clean up if email fails
      await User.deleteOne({ _id: tempUser._id, status: "pending" });
      await UserVerification.deleteOne({ userId: tempUser._id });
      throw new Error(emailResult.message);
    }

    return {
      message:
        "OTP đã được gửi đến email của bạn. Vui lòng kiểm tra và xác thực.",
      data: { email },
    };
  } catch (error) {
    throw error;
  }
}

async function verifySignup(email, otpInput) {
  try {
    // Verify OTP using new OTP service
    const verifyResult = await OTPService.verifyOTP(
      email,
      otpInput,
      User,
      UserVerification,
      {
        userQuery: { status: "pending" },
        maxAttempts: 5,
      }
    );

    if (!verifyResult.success) {
      throw new Error(verifyResult.message);
    }

    const { user } = verifyResult;

    // Update user status to active and store password directly
    await User.findByIdAndUpdate(user._id, {
      status: "active",
      passwordHash: user.tempPasswordHash,
      $unset: { tempPasswordHash: 1 },
    });

    // Clean up verification record
    await UserVerification.deleteOne({ userId: user._id });

    return {
      message: "Đăng ký thành công! Bạn có thể đăng nhập ngay bây giờ.",
      data: {
        userId: user._id,
        email: user.email,
        name: user.name,
        nickName: user.nickName,
      },
    };
  } catch (error) {
    throw error;
  }
}

module.exports = {
  initiateSignup,
  verifySignup,
};
