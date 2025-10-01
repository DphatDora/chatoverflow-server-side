const userInfoService = require('../../services/user/UserInfo.service');
const ApiResponse = require('../../dto/res/api.response');
const UserRequestDto = require('../../dto/req/user.request');
const UserResponseDto = require('../../dto/res/user.response');

exports.updateUserInfo = async (req, res) => {
  try {
    const validation = UserRequestDto.validate(req.body);
    if (!validation.valid) {
      return res.status(400).json(ApiResponse.error(validation.message));
    }

    const sanitizedData = UserRequestDto.sanitize(req.body);
    const result = await userInfoService.updateUserInfo(
      req.userId,
      sanitizedData
    );

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
    return res
      .status(500)
      .json(ApiResponse.error('Lỗi hệ thống khi cập nhật thông tin'));
  }
};

exports.getUserProfile = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    // Validate pagination parameters
    if (page < 1 || limit < 1 || limit > 100) {
      return res
        .status(400)
        .json(ApiResponse.error('Tham số phân trang không hợp lệ'));
    }

    const result = await userInfoService.getUserProfile(
      req.userId,
      page,
      limit
    );

    if (!result.success) {
      return res.status(400).json(ApiResponse.error(result.message));
    }

    return res
      .status(200)
      .json(ApiResponse.success(result.message, result.data));
  } catch (error) {
    console.error('Get user profile error:', error);
    return res
      .status(500)
      .json(ApiResponse.error('Lỗi hệ thống khi lấy thông tin profile'));
  }
};

exports.getUserStatistics = async (req, res) => {
  try {
    const userId = req.userId;
    console.log('userId:', userId);
    if (!userId) {
      return res
        .status(401)
        .json(ApiResponse.error('Phiên đăng nhập không hợp lệ'));
    }
    const result = await userInfoService.getUserStatistics(userId);
    if (!result.success) {
      return res.status(400).json(ApiResponse.error(result.message));
    }
    return res
      .status(200)
      .json(ApiResponse.success(result.message, result.data));
  } catch (error) {
    console.error('Get user statistics error:', error);
    return res
      .status(500)
      .json(ApiResponse.error('Lỗi hệ thống khi lấy thông tin thống kê'));
  }
};
