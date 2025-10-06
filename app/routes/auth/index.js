const express = require('express');
const router = express.Router();

router.use('/login', require('./login'));
router.use('/refresh-token', require('./refresh-token'));
router.use('/logout', require('./logout'));
router.use('/signup', require('./signup'));
router.use('/forgot-password', require('./forgot-password'));
//router.use('/reset-password', require('./reset-password'));

module.exports = router;
