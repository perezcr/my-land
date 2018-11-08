const mongoose = require('mongoose');

// SCHEMA SET UP
const notificationSchema = new mongoose.Schema({
  username: String,
  avatar: String,
  type: { type: String, enum: ['Landscape', 'Comment', 'Follow'] },
  landscapeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Landscape' },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  isRead: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Notification', notificationSchema);