const express = require('express');
const router = express.Router();
const questionController = require('../../controller/topic/Question.controller');
const authMiddleware = require('../../middleware/App.middleware');

// GET /question/:type
router.get('/:type', questionController.getQuestions);
router.get('/detail/:id', questionController.getQuestionDetail);
router.post('/create', authMiddleware, questionController.createQuestion);
router.put(
  '/:questionId/edit',
  authMiddleware,
  questionController.editQuestion
);

/* 
  Temporary remove authMiddleware for testing purpose.
  Expected response is questions created by specific user with userId.
*/
router.get('/user/:userId', questionController.getUserQuestions);
// router.get(
//   '/user/:userId',
//   authMiddleware,
//   questionController.getUserQuestions
// );

module.exports = router;
