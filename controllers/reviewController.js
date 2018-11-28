const mongoose = require('mongoose');
const Review = mongoose.model('Review');
const Landscape = mongoose.model('Landscape');

// Display all reviews on GET
exports.getReviews = async (req, res) => {
  const landscape = await Landscape.findById(req.params.id).populate({
    path: 'reviews',
    populate: { path: 'author' },
    options: { sort: { createdAt: -1 } }
  });
  if (!landscape) {
    req.flash('error', 'Landscape not found ❌');
    return res.redirect('back');
  }
  res.render('reviews/index', { landscape });
};

// Handle review create on POST
exports.createReview = async (req, res) => {
  const landscape = await Landscape.findById(req.params.id).populate('reviews');
  const review = await Review.create({
    rating: req.body.rating,
    text: req.body.text,
    author: req.user._id,
    landscape: landscape._id
  });  
  landscape.reviews.push(review);
  landscape.rating = calculateAverage(landscape.reviews);
  await landscape.save(); 
  req.flash('success', 'Your review has been successfully added ✅');
  res.redirect(`/landscapes/${landscape._id}`);
};

// Handle review update on PUT.
exports.updateReview = async (req, res) => {
  const reviewPromise = Review.findOneAndUpdate({ _id: req.params.review_id }, req.body.review, { new: true, runValidators: true });
  const landscapePromise = Landscape.findById(req.params.id).populate('reviews').exec();
  const [, landscape] = await Promise.all([reviewPromise, landscapePromise]);
  if (!landscape) {
    req.flash('error', 'Landscape not found ❌');
    return res.redirect('back');
  }
  landscape.rating = calculateAverage(landscape.reviews);
  await landscape.save();
  req.flash('success', 'Your review was successfully edited ✅');
  res.redirect(`/landscapes/${landscape._id}`);
};

// Handle review delete on DELETE.
exports.deleteReview = async (req, res) => {
  const reviewPromise = Review.findByIdAndRemove(req.params.review_id);
  const landscapePromise = Landscape.findOneAndUpdate({ _id: req.params.id }, { $pull: { reviews: req.params.review_id } }, { new: true }).populate('reviews').exec();
  const [, landscape] = await Promise.all([reviewPromise, landscapePromise]);
  landscape.rating = calculateAverage(landscape.reviews);
  await landscape.save();
  req.flash('success', 'Your review was deleted successfully ✅');
  res.redirect(`/landscapes/${landscape._id}`);
};

// Middleware check ownership
exports.checkReviewOwnership = async (req, res, next) => {
  const review = await Review.findById(req.params.review_id);
  if (!review) {
    req.flash('error', 'Review not found ❌');
    return res.redirect('back');
  } 
  if (review.author.equals(req.user._id) || req.user.isAdmin) {
    return next();
  }
  req.flash('error', 'You don\'t have permission to do that 🚫');
  res.redirect('back'); 
};

// Middleware check reviews existence
exports.checkReviewExistence = async (req, res, next) => {
  const landscape = await Landscape.findById(req.params.id).populate('reviews');
  if (!landscape) {
    req.flash('error', 'Landscape not found');
    return res.redirect('back');
  }
  const foundUserReview = landscape.reviews.some(review => {
    return review.author.equals(req.user._id);
  });
  if (foundUserReview) {
    req.flash('error', 'You already wrote a review 🚫');
    return res.redirect('back');
  }
  // if the review was not found, go to the next middleware
  next();
};

// Calculate Average
function calculateAverage(reviews) {
  return reviews.length !== 0 ? reviews.reduce((acc, cur) => acc+cur.rating, 0) / reviews.length : 0;
}