const authService = require("../../services/auth/Login.service");
const ApiResponse = require("../../dto/res/api.response");
const LoginRequest = require("../../dto/req/login.request");
const { StatusCodes, ReasonPhrases } = require("http-status-codes");

exports.login = async (req, res) => {
  try {
    const loginReq = new LoginRequest(req.body);
    const token = await authService.login(loginReq);
    const response = ApiResponse.success("Login successful", { token });
    res.status(StatusCodes.OK).json(response);
  } catch (error) {
    let statusCode = StatusCodes.INTERNAL_SERVER_ERROR;
    let message = ReasonPhrases.INTERNAL_SERVER_ERROR;

    if (error.message === "Invalid credentials") {
      statusCode = StatusCodes.UNAUTHORIZED;
      message = error.message;
    }

    const response = ApiResponse.error(message);
    res.status(statusCode).json(response);
  }
};
