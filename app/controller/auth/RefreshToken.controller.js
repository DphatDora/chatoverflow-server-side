const authService = require("../../services/auth/RefreshToken.service");
const ApiResponse = require("../../dto/res/api.response");
const { StatusCodes } = require("http-status-codes");

exports.refreshToken = async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
      return res
        .status(StatusCodes.UNAUTHORIZED)
        .json(ApiResponse.error("Refresh token not provided"));
    }

    const { accessToken, refreshToken: newRefreshToken } =
      await authService.refreshToken(refreshToken);

    // Set new refresh token cookie
    res.cookie("refreshToken", newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV,
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    const response = ApiResponse.success("Token refreshed successfully", {
      accessToken,
    });

    res.status(StatusCodes.OK).json(response);
  } catch (error) {
    let statusCode = StatusCodes.UNAUTHORIZED;
    let message = error.message;

    // Clear invalid refresh token
    res.clearCookie("refreshToken");

    const response = ApiResponse.error(message);
    res.status(statusCode).json(response);
  }
};
