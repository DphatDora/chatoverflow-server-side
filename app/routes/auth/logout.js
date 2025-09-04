const express = require("express");
const router = express.Router();
const logoutController = require("../../controller/auth/Logout.controller");

router.post("/", logoutController.logout);
//router.post("/all");
module.exports = router;
