const mongoose = require('mongoose');

// SCHEMA SET UP
const landscapeSchema = new mongoose.Schema({
  name : { type: String, required: true },
  entranceFee: String,
  image : { type: String, required: true },
  imageId: { type: String, required: true },
  description : String,
  location: { type: String, required: true },
  lat: Number,
  lng: Number,
  createdAt: { type: Date, default: Date.now },
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