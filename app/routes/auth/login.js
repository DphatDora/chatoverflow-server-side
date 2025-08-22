const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
   // handle login logic here, pleaseeeeeee
   res.send('Login route');
});

module.exports = router;
