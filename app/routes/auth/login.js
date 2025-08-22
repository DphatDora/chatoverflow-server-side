const express = require('express');
const router = express.Router();
const {
   testLogin,
} = require('../../controller/auth/Login.controller');

router.get('/', testLogin);

module.exports = router;
