const mongoose = require('mongoose');
const Question = require('../../models/Question.model');
const Blog = require('../../models/Blog.model');

mongoose
  .connect(
    'mongodb+srv://team:camonquykhach@cluster0.ndk5o1m.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0'
  )
  .then(async () => {
    console.log('Creating indexes...');
    await Question.createIndexes();
    await Blog.createIndexes();
    console.log('✅ Indexes created successfully!');
    process.exit(0);
  });
