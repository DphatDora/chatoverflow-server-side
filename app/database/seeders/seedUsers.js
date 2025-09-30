require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../../models/User.model');

const usersData = [];

const genders = ['male', 'female', 'other'];
const statuses = ['active', 'inactive', 'banned', 'pending'];

async function seedUsers() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);

    // Delete existed data
    await User.deleteMany({});

    // Hash password
    for (let i = 1; i <= 30; i++) {
      usersData.push({
        name: `User ${i}`,
        nickName: `nick${i}`,
        email: `user${i}@example.com`,
        password: bcrypt.hashSync('123456', 10),
        avatar: `https://i.pravatar.cc/150?img=${i}`,
        dateOfBirth: new Date(1990 + (i % 10), i % 12, i),
        address: {
          province: `Province ${i}`,
          ward: `Ward ${i}`,
          street: `Street ${i}`,
        },
        gender: genders[i % 3],
        status: statuses[0],
      });
    }

    // Insert into DB
    await User.insertMany(usersData);

    console.log('✅ Seed users success!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Seed users failed:', err.message);
    process.exit(1);
  }
}

seedUsers();
