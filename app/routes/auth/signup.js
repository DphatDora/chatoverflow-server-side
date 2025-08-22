const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
   // handle signup logic here, pleaseeeeeee
   res.send('Signup route');
});

module.exports = router;

/*
sample implement write by chatgpt, --HAVE"T AUDITED SO CHECK WITH CAUTION !!!---

const express = require('express');
const bcrypt = require('bcrypt');
const User = require('../../models/User.model');
const Credential = require('../../models/Credential.model');

const router = express.Router();

router.post('/', async (req, res) => {
  try {
    const { name, nickName, email, password } = req.body;

    // 1. Check if email exists
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ message: 'Email already registered' });

    // 2. Create user
    const user = new User({ name, nickName, email });
    await user.save();

    // 3. Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // 4. Store credentials
    const cred = new Credential({ userId: user._id, passwordHash });
    await cred.save();

    res.status(201).json({ message: 'User created', userId: user._id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;

*/
