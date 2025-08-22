const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
   // handle logout logic here, pleaseeeeeee
   res.send('Logout route');
});

module.exports = router;
