const express = require("express");
const router = express.Router();
const loginController = require("../../controller/auth/Login.controller");

router.post("/", loginController.login);

module.exports = router;
