const mongoose = require('mongoose');
const Comment = require('./comment');

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

landscapeSchema.pre('remove', async function(){
  try {
    await Comment.deleteMany({ '_id': { $in: this.comments } });
  } catch (err) {
    console.log("Error deleteting comments!");
  }
});

module.exports = mongoose.model('Landscape', landscapeSchema);