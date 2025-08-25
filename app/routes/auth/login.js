const express = require("express");
const router = express.Router();
const { login } = require("../../controller/auth/Login.controller");

router.post("/", login);

module.exports = router;
