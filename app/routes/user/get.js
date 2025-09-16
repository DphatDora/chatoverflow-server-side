const express = require('express');
const router = express.Router();
const { getUsers } = require('../../controller/user/UserGet.controller');

// Get user info
router.get('/', getUsers);

module.exports = router;
