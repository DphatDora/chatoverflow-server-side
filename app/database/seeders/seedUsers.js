require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("../../models/User.model");

async function seedUsers() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);

    // Delete existed data
    await User.deleteMany({});

    // Hash password
    const hashedPassword = await bcrypt.hash("12345678", 10);

    const users = [
      {
        name: "Admin User",
        nickName: "admin",
        email: "admin@example.com",
        password: hashedPassword,
        avatar: "",
      },
      {
        name: "Test User 1",
        nickName: "user1",
        email: "user1@example.com",
        password: hashedPassword,
        avatar: "",
      },
      {
        name: "Test User 2",
        nickName: "user2",
        email: "user2@example.com",
        password: hashedPassword,
        avatar: "",
      },
    ];

    // Insert into DB
    await User.insertMany(users);

    console.log("✅ Seed users success!");
    process.exit(0);
  } catch (err) {
    console.error("❌ Seed users failed:", err.message);
    process.exit(1);
  }
}

seedUsers();
