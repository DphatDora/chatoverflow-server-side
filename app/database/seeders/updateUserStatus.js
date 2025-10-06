require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../../models/User.model');

async function activateAllUsers() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);

    // Update all users' status to "active"
    const result = await User.updateMany({}, { status: 'active' });

    console.log(`✅ Updated ${result.modifiedCount} users to status "active"`);
    process.exit(0);
  } catch (err) {
    console.error('❌ Failed to update users:', err.message);
    process.exit(1);
  }
}

activateAllUsers();
