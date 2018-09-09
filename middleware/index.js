const Landscape  = require('../models/landscape');
const Comment     = require('../models/comment');

const middlewareObj = {
   checkLandscapeOwnership: (req, res, next) => {
      if(req.isAuthenticated()){
         Landscape.findById(req.params.id, (err, landscape) => {
            if(err || !landscape){
               req.flash('error', 'Landscape not found');
               res.redirect('back');
            } else if(landscape.author.id.equals(req.user._id) || req.user.isAdmin){
               // Landscape.author.id is an object 
               // rq.user._id is a String 
               next(); // means next to middleware
            } else{
               req.flash('error', 'You don\'t have permission');
               res.redirect('back'); // last page
            }
         });
      } else{
         req.flash('error', 'You need to be logged in');
         res.redirect('back'); // last page
      }
   },
   checkCommentOwnership: (req, res, next) => {
      if(req.isAuthenticated()){
         Comment.findById(req.params.comment_id, (err, comment) => {
            if(err || !comment){
               req.flash('error', 'Comment not found');
               res.redirect('back');
            } else{
               if(comment.author.id.equals(req.user._id) || req.user.isAdmin){
                  next();
               } else{
                  req.flash('error', "You don't have permission");
                  res.redirect('back');
               }
            }
         });
      } else{
         req.flash('error', 'You need to be logged in');
         res.redirect('back');
      }
   },
   isLoggedIn: (req, res, next) => {
      if(req.isAuthenticated()){
         return next();
      }
      /** key: error, value: 'Please Login First! */
      req.flash('error', 'You need to be logged in');
      res.redirect('/login');
   }
};

module.exports = middlewareObj;
