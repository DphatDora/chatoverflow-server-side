const express = require("express");
const router = express.Router();
const refreshTokenController = require("../../controller/auth/RefreshToken.controller");

router.post("/", refreshTokenController.refreshToken);

module.exports = router;
