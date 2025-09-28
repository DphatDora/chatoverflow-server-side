require('dotenv').config();
const jwt = require('jsonwebtoken');
const ApiResponse = require('../dto/res/api.response');

const auth = (req, res, next) => {
  const white_lists = [
    '/auth/signup',
    '/auth/signup/verify-otp',
    '/auth/signup/resend-otp',
    '/auth/login',
    '/auth/forgot-password/send-otp',
    '/auth/forgot-password/verify-otp',
    '/auth/forgot-password/reset-password',
    '/auth/logout',

    '/chat/conversations',
  ];

  // Check if current path is in whitelist
  const isWhitelisted =
    white_lists.some((path) => {
      return (
        req.originalUrl === path ||
        (path !== '/' && req.originalUrl.startsWith(path))
      );
    }) || req.originalUrl === '/'; // Handle root path separately

  if (isWhitelisted) {
    return next();
  } else {
    if (req?.headers?.authorization?.split(' ')?.[1]) {
      const token = req.headers.authorization.split(' ')[1];
      try {
        const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
        // Kiểm tra token có hết hạn không
        const currentTime = Math.floor(Date.now() / 1000);
        if (decoded.exp && decoded.exp < currentTime) {
          return res.status(401).json(ApiResponse.error('Token đã hết hạn'));
        }
        // Gắn trực tiếp vào request
        req.userId = decoded.sub;
        next();
      } catch (error) {
        if (error.name === 'TokenExpiredError') {
          return res.status(401).json(ApiResponse.error('Token đã hết hạn'));
        } else if (error.name === 'JsonWebTokenError') {
          return res.status(401).json(ApiResponse.error('Token không hợp lệ'));
        } else {
          return res.status(401).json(ApiResponse.error('Lỗi xác thực token'));
        }
      }
    } else {
      return res.status(401).json(ApiResponse.error('Không tìm thấy token'));
    }
  }
};

module.exports = auth;
