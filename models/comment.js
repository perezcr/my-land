const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
  text : {
    type: String,
    required: 'You must supply a comment'
  },
  author : { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User',
    required: 'Author ID is required'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Comment', commentSchema);