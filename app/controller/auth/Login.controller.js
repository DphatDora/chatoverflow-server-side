const authService = require("../../services/auth/Login.service");
const ApiResponse = require("../../dto/res/api.response");
const LoginRequest = require("../../dto/req/login.request");
const { StatusCodes, ReasonPhrases } = require("http-status-codes");
const { NewLoginResponse } = require("../../dto/res/login.response");

exports.login = async (req, res) => {
  try {
    const loginReq = new LoginRequest(req.body);
    const { user, token } = await authService.login(loginReq);

    const loginResponse = NewLoginResponse(user, token);
    const response = ApiResponse.success("Login successfully", loginResponse);

    res.status(StatusCodes.OK).json(response);
  } catch (error) {
    let statusCode = error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR;
    let message = error.message || ReasonPhrases.INTERNAL_SERVER_ERROR;

    if (error.message === "Invalid credentials") {
      statusCode = StatusCodes.UNAUTHORIZED;
      message = error.message;
    }

    const response = ApiResponse.error(message);
    res.status(statusCode).json(response);
  }
};
