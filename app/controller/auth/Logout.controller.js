const authService = require("../../services/auth/Logout.service");
const ApiResponse = require("../../dto/res/api.response");
const { StatusCodes } = require("http-status-codes");

exports.logout = async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken;

    await authService.logout(refreshToken);

    // Clear refresh token cookie
    res.clearCookie("refreshToken");

    const response = ApiResponse.success("Logout successfully");
    res.status(StatusCodes.OK).json(response);
  } catch (error) {
    const response = ApiResponse.error(error.message);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(response);
  }
};

// exports.logoutAll = async (req, res) => {
//   try {
//     const userId = req.user.userId; // From auth middleware

//     await authService.logoutAll(userId);

//     res.clearCookie("refreshToken");

//     const response = ApiResponse.success("Logged out from all devices");
//     res.status(StatusCodes.OK).json(response);
//   } catch (error) {
//     const response = ApiResponse.error(error.message);
//     res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(response);
//   }
// };
