const Comment   = require('../models/comment');
const Landscape = require('../models/landscape');

// Display comment new form on GET
exports.commentNew = function(req, res){
  Landscape.findById(req.params.id, (err, landscape) => {
    if(err || !landscape){
      req.flash('error', 'Landscape not found');
      res.redirect("/landscapes/" + req.params.id);
    } else{
      res.render("comments/new", { landscape: landscape });
    }
  });
};

// Handle comment create on POST
exports.commentCreate = function(req, res){
  Landscape.findById(req.params.id, (err, landscape) => {
    if(err || !landscape){
      req.flash('error', 'Landscape not found');
      res.redirect("/landscapes/" + req.params.id);
    } else{
      Comment.create({
        text: req.body.text,
        author: {
          id: req.user._id,
          username: req.user.username
        }
      }, function(err, comment){
        if(err){
          req.flash('error', err);
          res.redirect("/landscapes/" + landscape._id);
        } else{
          landscape.comments.push(comment);
          landscape.save();
          req.flash('success', 'The comment was created');
          res.redirect("/landscapes/" + landscape._id);
        }
      });
    }
  });
};

// Display comment update form on GET
exports.commentEdit = function(req, res){
  Landscape.findById(req.params.id, (err, landscape) => {
    if(err || !landscape){
      req.flash('error', 'Landscape not found');
      res.redirect('/landscapes');
    } else{
      Comment.findById(req.params.comment_id, (err, comment) => {
        if(err){
          req.flash('error', err);
          res.redirect('back');
        } else{
          res.render('comments/edit', {landscape_id: req.params.id, comment: comment});
        }
      });
    }
  });
};

// Handle comment update on PUT.
exports.commentUpdate = function(req, res){
  Comment.findByIdAndUpdate(req.params.comment_id, req.body.comment, (err, comment) => {
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
  Comment.findByIdAndRemove(req.params.comment_id, (err) => {
    if(err){
      req.flash('error', err);
      res.redirect('back');
    } else{
      req.flash('success', 'The comment was deleted');
      res.redirect('back');
    }
  });
};