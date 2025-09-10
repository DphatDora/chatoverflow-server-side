<<<<<<< HEAD
const express = require("express");
const router = express.Router();
const questionController = require("../../controller/topic/Question.controller");

// GET /question/:type
router.get("/:type", questionController.getQuestions);
=======
const express = require('express');
const router = express.Router();
const questionController = require('../../controller/topic/Question.controller');

// GET /question/:type
router.get('/:type', questionController.getQuestions);
router.get('/detail/:id', questionController.getQuestionDetail);
>>>>>>> upstream/main

module.exports = router;
