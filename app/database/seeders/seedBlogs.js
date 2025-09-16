require('dotenv').config();
const mongoose = require('mongoose');
const Blog = require('../../models/Blog.model');
const User = require('../../models/User.model');
const slugify = require('slugify');

async function seedBlogs() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);

    // Delete existing blogs
    await Blog.deleteMany({});

    // Get all users from DB
    const users = await User.find();
    if (!users.length) {
      throw new Error('No users found. Please seed users first.');
    }

    // Blog sample data
    const blogs = [];
    for (let i = 1; i <= 10; i++) {
      const title = `Sample Blog Post ${i}`;

      const randomUser = users[Math.floor(Math.random() * users.length)];

      blogs.push({
        title,
        content_html: `<p>This is the content of blog post ${i}. It is just a demo blog seeded for testing purposes.</p>`,
        summary: `This is a short summary of blog post ${i}.`,
        coverImage:
          'https://play-lh.googleusercontent.com/nc0SSBJurEA55LimjVcQBUziYQSzWeEctjb5uLtzBsBa_oI3EEbzxtp9uIaqvP2jtl8=w3840-h2160-rw',
        user: randomUser._id,
        tags: ['demo', 'sample', `tag${i}`],
        isPublished: true,
        slug: slugify(title, { lower: true, strict: true }),
      });
    }

    // Insert into DB
    await Blog.insertMany(blogs);

    console.log('✅ Seed blogs success!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Seed blogs failed:', err.message);
    process.exit(1);
  }
}

seedBlogs();
