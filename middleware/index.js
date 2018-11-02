const Landscape = require('../models/landscape');
const User      = require('../models/user');
const Comment   = require('../models/comment');

const middlewareObj = {
  checkUserOwnership: (req, res, next) => {
    if (req.isAuthenticated()) {
      User.findById(req.params.id, (err, user) => {
        if (err || !user) {
          req.flash('error', 'User not found');
          res.redirect('/landscapes');
        } else if (user._id.equals(req.user._id)) {
          next(); // means next to middleware
        } else {
          req.flash('error', 'You don\'t have permission');
          res.redirect('/landscapes'); // last page
        }
      });
    } else {
      req.flash('error', 'You need to be logged in');
      res.redirect('/landscapes'); // last page
    }
  },
  checkLandscapeOwnership: (req, res, next) => {
    if (req.isAuthenticated()) {
      Landscape.findById(req.params.id, (err, landscape) => {
        if (err || !landscape) {
          req.flash('error', 'Landscape not found');
          res.redirect('/landscapes');
        } else if (landscape.author.id.equals(req.user._id) || req.user.isAdmin) {
          // Landscape.author.id is an object 
          // rq.user._id is a String 
          next(); // means next to middleware
        } else {
          req.flash('error', 'You don\'t have permission');
          res.redirect('/landscapes'); // last page
        }
      });
    } else {
      req.flash('error', 'You need to be logged in');
      res.redirect('/landscapes'); // last page
    }
  },
  checkCommentOwnership: (req, res, next) => {
    if (req.isAuthenticated()) {
      Comment.findById(req.params.comment_id, (err, comment) => {
        if (err || !comment) {
          req.flash('error', 'Comment not found');
          res.redirect('/landscapes');
        } else {
          if (comment.author.id.equals(req.user._id) || req.user.isAdmin) {
            next();
          } else {
            req.flash('error', "You don't have permission");
            res.redirect('/landscapes');
          }
        }
      });
    } else {
      req.flash('error', 'You need to be logged in');
      res.redirect('/landscapes');
    }
  },
  isLoggedIn: (req, res, next) => {
    if (req.isAuthenticated()) {
      return next();
    }
    /** key: error, value: 'Please Login First! */
    req.flash('error', 'You need to be logged in');
    res.redirect('/login');
  }
};

module.exports = middlewareObj;
