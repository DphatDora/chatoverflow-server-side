const express = require('express');
const router = express.Router();
const auth = require('../../middleware/App.middleware');

router.use('/get-my-info', auth, require('./info'));
router.use('/edit', auth, require('./info'));
router.use('/', require('./get'));
router.use('/statistics', auth, require('./statistics'));
// router.use("/blocked", auth, require("./blocked"));
// router.use("/friend", auth, require("./friend"));
// router.use("/online", auth, require("./online"));

module.exports = router;
