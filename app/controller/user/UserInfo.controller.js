const userInfoService = require("../../services/user/UserInfo.service");
const ApiResponse = require("../../dto/res/api.response");
const UserRequestDto = require("../../dto/req/user.request");
const UserResponseDto = require("../../dto/res/user.response");

exports.getUserInfo = async (req, res) => {
  try {
    console.log("Getting user info for user ID:", req.userId);
    const result = await userInfoService.getUserInfo(req.userId);

    if (!result.success) {
      return res.status(400).json(ApiResponse.error(result.message));
    }

    return res
      .status(200)
      .json(
        ApiResponse.success(
          result.message,
          UserResponseDto.fromUser(result.data)
        )
      );
  } catch (error) {
    console.error("Get user info error:", error);
    return res
      .status(500)
      .json(ApiResponse.error("Lỗi hệ thống khi lấy thông tin người dùng"));
  }
};

exports.updateUserInfo = async (req, res) => {
  try {
    const validation = UserRequestDto.validate(req.body);
    if (!validation.valid) {
      console.log("Validation failed:", validation.message);
      return res.status(400).json(ApiResponse.error(validation.message));
    }

    const sanitizedData = UserRequestDto.sanitize(req.body);
    const result = await userInfoService.updateUserInfo(
      req.userId,
      sanitizedData
    );
    console.log("Update user info result:", result);

    if (!result.success) {
      console.log("Update user info failed:", result.message);
      return res.status(400).json(ApiResponse.error(result.message));
    }

    return res
      .status(200)
      .json(
        ApiResponse.success(
          result.message,
          UserResponseDto.fromUser(result.data)
        )
      );
  } catch (error) {
    console.error("Update user info error:", error);
    return res
      .status(500)
      .json(ApiResponse.error("Lỗi hệ thống khi cập nhật thông tin"));
  }
};
