const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
   // handle login logic here, pleaseeeeeee
   res.send('Login route');
});

module.exports = router;

/*
sample implement write by chatgpt, --HAVE"T AUDITED SO CHECK WITH CAUTION !!!---

// /app/routes/auth/login.js
const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../../models/User.model');
const Credential = require('../../models/Credential.model');

const router = express.Router();

router.post('/', async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. Find user
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'Invalid email or password' });

    // 2. Find credentials
    const cred = await Credential.findOne({ userId: user._id });
    if (!cred) return res.status(400).json({ message: 'Invalid email or password' });

    // 3. Compare password
    const isMatch = await bcrypt.compare(password, cred.passwordHash);
    if (!isMatch) return res.status(400).json({ message: 'Invalid email or password' });

    // 4. Create JWT
    const token = jwt.sign(
      { id: user._id, email: user.email },
      process.env.JWT_SECRET || 'dev_secret',
      { expiresIn: '1h' }
    );

    res.json({ message: 'Login successful', token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;


--------------env: JWT_SECRET=super-secret-key
*/
