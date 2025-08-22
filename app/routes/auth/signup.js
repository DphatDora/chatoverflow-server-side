const express = require('express');
const router = express.Router();
const {
   testSignup,
} = require('../../controller/auth/Signup.controller');

router.get('/', testSignup);

module.exports = router;
