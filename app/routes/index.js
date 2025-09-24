var express = require('express');
var router = express.Router();

/* GET home page. */

router.get('/', function (req, res, next) {
  res.render('index', { title: 'Express' });
});
router.use('/auth', require('./auth'));
router.use('/user', require('./user'));
router.use('/question', require('./topic'));
router.use('/blog', require('./blog'));
router.use('/tags', require('./tag'));
router.use('/search', require('./search'));

module.exports = router;
