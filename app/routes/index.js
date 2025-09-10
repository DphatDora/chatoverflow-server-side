var express = require("express");
var router = express.Router();

/* GET home page. */
<<<<<<< HEAD
router.get("/", function (req, res, next) {
  res.render("index", { title: "Express" });
});
router.use("/auth", require("./auth"));
router.use("/question", require("./topic"));
=======
router.get('/', function (req, res, next) {
  res.render('index', { title: 'Express' });
});
router.use('/auth', require('./auth'));
router.use('/user', require('./user'));
router.use('/question', require('./topic'));
>>>>>>> upstream/main

module.exports = router;
