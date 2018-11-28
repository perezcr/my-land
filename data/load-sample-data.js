require('dotenv').config({ path: __dirname + '/../.env' });
const fs = require('fs');

const mongoose = require('mongoose');
// Set up mongoose connection
mongoose.connect(process.env.MONGODB_URL, { useCreateIndex: true, useNewUrlParser: true });

// Import all of our models
const User = require('../models/User');
const Comment = require('../models/Comment');
const Review = require('../models/Review');
const Notification = require('../models/Notification');
const Landscape = require('../models/Landscape');

const users = JSON.parse(fs.readFileSync(__dirname + '/users.json', 'utf-8'));
const landscapes = JSON.parse(fs.readFileSync(__dirname + '/landscapes.json', 'utf-8'));
const reviews = JSON.parse(fs.readFileSync(__dirname + '/reviews.json', 'utf-8'));
const comments = JSON.parse(fs.readFileSync(__dirname + '/comments.json', 'utf-8'));
const notifications = JSON.parse(fs.readFileSync(__dirname + '/notifications.json', 'utf-8'));

async function deleteData() {
  console.log('😢😢 Goodbye Data...');
  await User.deleteMany({});
  await Landscape.deleteMany({});
  await Review.deleteMany({});
  await Comment.deleteMany({});
  await Notification.deleteMany({});
  console.log('Data Deleted. To load sample data, run\n\n\t npm run sample\n\n');
  process.exit();
}

async function loadData() {
  try {
    await User.insertMany(users);
    await Landscape.insertMany(landscapes);
    await Review.insertMany(reviews);
    await Comment.insertMany(comments);
    await Notification.insertMany(notifications);
    console.log('👍👍👍👍👍👍👍👍 Done!');
    process.exit();
  } catch(error) {
    console.log('\n👎👎👎👎👎👎👎👎 Error! The Error info is below but if you are importing sample data make sure to drop the existing database first with.\n\n\t npm run blowitallaway\n\n\n');
    console.log(error);
    process.exit();
  }
}

if (process.argv.includes('--delete')) {
  deleteData();
} else {
  loadData();
}