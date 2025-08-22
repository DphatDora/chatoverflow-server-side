const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
   // handle forgot password logic here, pleaseeeeeee
   res.send('Forgot Password route');
});

module.exports = router;
