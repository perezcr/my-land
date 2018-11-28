const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  user: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User',
  },
  type: { 
    type: String,
    enum: ['Landscape', 'Comment', 'Follow'],
    required: 'Notification type is required'
  },
  landscape: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Landscape' 
  },
  isRead: { 
    type: Boolean, 
    default: false 
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  }
});

module.exports = mongoose.model('Notification', notificationSchema);