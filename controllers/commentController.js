const mongoose = require('mongoose');
const Comment = mongoose.model('Comment');
const Landscape = mongoose.model('Landscape');
const User = mongoose.model('User');
const Notification = mongoose.model('Notification');

// Handle comment create on POST
exports.createComment = async (req, res) => {
  const landscape = await Landscape.findById(req.params.id);
  if (!landscape) {
    req.flash('error', 'Landscape not found ❌');
    return res.redirect(`/landscapes/${req.params.id}`);
  }
  const comment = await Comment.create({
    text: req.body.text,
    author: req.user._id
  });
  landscape.comments.push(comment);
  await landscape.save();
  if (!landscape.author._id.equals(req.user._id)) {
    const userPromise = User.findById(landscape.author._id);
    const notificationPromise = Notification.create({
      user: req.user._id,
      type: 'Comment',
      landscape: landscape._id
    });
    const [user, notification] = await Promise.all([userPromise, notificationPromise]);
    user.notifications.push(notification);
    await user.save();  
  }
  req.flash('success', 'The comment was created ✅');
  res.redirect(`/landscapes/${req.params.id}`);
};

// Handle comment update on PUT.
exports.updateComment = async (req, res) => {
  await Comment.findOneAndUpdate({ _id: req.params.comment_id }, req.body.comment, { new: true, runValidators: true });
  req.flash('success', 'The comment was updated ✅');
  res.redirect(`/landscapes/${req.params.id}`);
};

// Handle comment delete on DELETE.
exports.deleteComment = async (req, res) => {
  const commentPromise = Comment.findOneAndDelete({ _id: req.params.comment_id });
  const landscapePromise = Landscape.findOneAndUpdate({ _id: req.params.id }, { $pull: { comments: req.params.comment_id } }, { new: true });
  await Promise.all([commentPromise, landscapePromise])
  req.flash('success', 'The comment was deleted ✅');
  res.redirect(`/landscapes/${req.params.id}`);
};

// Middleware check ownership
exports.checkCommentOwnership = async (req, res, next) => {
  const comment = await Comment.findById(req.params.comment_id);
  if (!comment) {
    req.flash('error', 'Comment not found ❌');
    return res.redirect(`/landscapes/${req.params.id}`);
  }
  if (comment.author.equals(req.user._id) || req.user.isAdmin) {
    return next();
  }
  req.flash('error', 'You don\'t have permission 🚫');
  res.redirect(`/landscapes/${req.params.id}`);
};