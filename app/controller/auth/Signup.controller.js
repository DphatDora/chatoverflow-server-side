const signupService = require("../../services/auth/Signup.service");
const ApiResponse = require("../../dto/res/api.response");
const OTPService = require("../../services/common/OTP.service");
const User = require("../../models/User.model");
const UserVerification = require("../../models/User.PasswordReset.model");
const {
  SignupInitiateRequest,
  SignupVerifyRequest,
} = require("../../dto/req/signup.request");
const {
  SignupInitiateResponse,
  SignupVerifyResponse,
} = require("../../dto/res/signup.response");

exports.initiateSignup = async (req, res) => {
  try {
    // Create and validate DTO
    const signupRequest = new SignupInitiateRequest(
      req.body.name,
      req.body.nickName,
      req.body.email,
      req.body.password
    );

    const validation = signupRequest.validate();
    if (!validation.isValid) {
      return res
        .status(400)
        .json(ApiResponse.error(validation.errors.join(", ")));
    }

    // Sanitize data
    const { name, nickName, email, password } = signupRequest.sanitize();

    const result = await signupService.initiateSignup(
      name,
      nickName,
      email,
      password
    );

    return res
      .status(200)
      .json(
        ApiResponse.success(
          result.message,
          SignupInitiateResponse.create(result.data.email)
        )
      );
  } catch (error) {
    return res.status(400).json(ApiResponse.error(error.message));
  }
};

exports.verifyOTP = async (req, res) => {
  try {
    // Create and validate DTO
    const verifyRequest = new SignupVerifyRequest(req.body.email, req.body.otp);

    const validation = verifyRequest.validate();
    if (!validation.isValid) {
      return res
        .status(400)
        .json(ApiResponse.error(validation.errors.join(", ")));
    }

    // Sanitize data
    const { email, otp } = verifyRequest.sanitize();

    const result = await signupService.verifySignup(email, otp);

    return res
      .status(200)
      .json(
        ApiResponse.success(
          result.message,
          SignupVerifyResponse.create(result.data)
        )
      );
  } catch (error) {
    return res.status(400).json(ApiResponse.error(error.message));
  }
};

exports.resendOTP = async (req, res) => {
  try {
    const { email } = req.body;

    // Validate email
    if (!email || email.trim().length === 0) {
      return res
        .status(400)
        .json(ApiResponse.error("Email không được để trống"));
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      return res.status(400).json(ApiResponse.error("Email không hợp lệ"));
    }

    const result = await OTPService.sendOTP(
      email.trim().toLowerCase(),
      User,
      UserVerification,
      "signup",
      {
        userQuery: { status: "pending" },
        userNotFoundMessage: "Không tìm thấy yêu cầu đăng ký cho email này",
      }
    );

    if (!result.success) {
      return res.status(400).json(ApiResponse.error(result.message));
    }

    return res
      .status(200)
      .json(
        ApiResponse.success(
          result.message,
          SignupInitiateResponse.create(email.trim().toLowerCase())
        )
      );
  } catch (error) {
    return res.status(400).json(ApiResponse.error(error.message));
  }
};
