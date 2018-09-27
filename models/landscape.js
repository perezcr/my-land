const mongoose = require('mongoose');

// SCHEMA SET UP
const landscapeSchema = new mongoose.Schema({
  name : { 
    type: String, 
    required: true 
  },
  image: { 
    id: {
      type: String, 
      required: true 
    },
    content: {
      type: String, 
      required: true 
    }
  },
  entranceFee: String,
  description : String,
  location: { 
    type: String, 
    required: true 
  },
  lat: Number,
  lng: Number,
  createdAt: { 
    type: Date, 
    default: Date.now 
  },
  author: {
    id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    username: String
  },
  comments: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Comment'
  }]
});

module.exports = mongoose.model('Landscape', landscapeSchema);