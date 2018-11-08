const Comment       = require('../models/comment');
const Landscape     = require('../models/landscape');
const User          = require('../models/user');
const Notification  = require('../models/notification');

// Handle comment create on POST
exports.commentCreate = async function(req, res){
  try {
    let landscape = await Landscape.findById(req.params.id);
    if(!landscape){
      req.flash('error', 'Landscape not found');
      return res.redirect(`/landscapes/${req.params.id}`);
    }
    let comment = await Comment.create({
      text: req.body.text,
      author: { id: req.user._id, username: req.user.username }
    });
    landscape.comments.push(comment);
    landscape.save();
    if(!landscape.author.id.equals(req.user._id)) {
      let user = await User.findById(landscape.author.id);
      let notification = await Notification.create({
        username: req.user.username,
        avatar: req.user.avatar.content,
        type: 'Comment',
        landscapeId: landscape._id
      });
      user.notifications.push(notification);
      user.save();  
    }
    req.flash('success', 'The comment was created');
    res.redirect(`/landscapes/${req.params.id}`);
  } catch (err) {
    req.flash('error', err);
    res.redirect(`/landscapes/${req.params.id}`);
  }
};

// Handle comment update on PUT.
exports.commentUpdate = function(req, res){
  Comment.findOneAndUpdate({ _id: req.params.comment_id }, req.body.comment, (err, comment) => {
    if(err){
      req.flash('error', err);
      res.redirect('back');
    } else{
      req.flash('success', 'The comment was updated');
      res.redirect('/landscapes/' + req.params.id);
    }
  });
};

// Handle comment delete on DELETE.
exports.commentDestroy = function(req, res){
  Comment.findOneAndDelete({ _id: req.params.comment_id }, (err) => {
    if(err) {
      req.flash('error', err);
      res.redirect('back');
    } else {
      req.flash('success', 'The comment was deleted');
      res.redirect('back');
    }
  });
};