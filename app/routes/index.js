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

router.use('/chat', require('./chat'));

router.use('/answer', require('./answer'));
router.use('/reply', require('./reply'));
router.use('/notifications', require('./notification'));


module.exports = router;
