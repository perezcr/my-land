const mongoose = require('mongoose');
const Comment = mongoose.model('Comment');
const Review = mongoose.model('Review');
const cloudinary = require('../handlers/cloudinary');

const landscapeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: 'Name field is required'
  },
  image: {
    id: {
      type: String,
      required: 'ID for Image is required'
    },
    content: {
      type: String,
      required: 'You must upload an Image'
    },  
  },
  location: {
    type: String,
    required: 'You must supply a Location'
  },
  lat: {
    type: Number,
    required: 'You must supply a Latitude coordinate'
  },
  lng: {
    type: Number,
    required: 'You must supply a Longitude coordinate'
  },
  description: String,
  author: {  
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: 'Author ID is required' 
  },
  comments: [
    { type: mongoose.Schema.Types.ObjectId, ref: 'Comment' }
  ],
  reviews: [
    { type: mongoose.Schema.Types.ObjectId, ref: 'Review'}
  ],
  rating: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

landscapeSchema.pre('findOne', function (next) {
  this.populate('author');
  next();
});

landscapeSchema.pre('remove', async function() {
  const delCommentsPromise = Comment.deleteMany({ '_id': { $in: this.comments } });
  const delReviewsPromise = Review.deleteMany({ '_id': {$in: this.reviews } });
  const delUploadedImage = cloudinary.uploader.destroy(this.image.id);
  await Promise.all([delCommentsPromise, delReviewsPromise, delUploadedImage]); 
});

module.exports = mongoose.model('Landscape', landscapeSchema);