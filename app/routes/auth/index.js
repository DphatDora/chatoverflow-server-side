const express = require("express");
const router = express.Router();

router.use("/login", require("./login"));
router.use("/refresh-token", require("./refresh-token"));
router.use("/logout", require("./logout"));
router.use("/signup", require("./signup"));
router.use("/forgot-password", require("./forgot-password"));

module.exports = router;
