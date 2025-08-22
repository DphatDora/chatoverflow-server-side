const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
   // handle signup logic here, pleaseeeeeee
   res.send('Signup route');
});

module.exports = router;
