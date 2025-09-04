const express = require("express");
const router = express.Router();
const questionController = require("../../controller/topic/Question.controller");

// GET /question/:type
router.get("/:type", questionController.getQuestions);

module.exports = router;
