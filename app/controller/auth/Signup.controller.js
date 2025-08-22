const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../../models/User.model');
const Credential = require('../../models/Credential.model');

exports.testSignup = (req, res) =>
   res.send('Signup controller called');

// placeholder logic write by chatgpt, dirty code without service call,
// just for testing --HAVE"T AUDITED SO CHECK WITH CAUTION !!!---
exports.signup = async (req, res) => {
   try {
      const { name, nickName, email, password } = req.body;

      const existing = await User.findOne({ email });
      if (existing)
         return res
            .status(400)
            .json({ message: 'Email already registered' });

      const user = new User({ name, nickName, email });
      await user.save();

      const passwordHash = await bcrypt.hash(password, 10);
      const cred = new Credential({ userId: user._id, passwordHash });
      await cred.save();

      res.status(201).json({
         message: 'User created',
         userId: user._id,
      });
   } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Server error' });
   }
};

//--------------env: JWT_SECRET=super-secret-key
