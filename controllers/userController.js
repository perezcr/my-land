const User = require('../models/user');
const Landscape = require('../models/landscape');

// Display detail page for a specific user on GET
exports.userShow = function(req, res){
  User.findById(req.params.id, (err, user) => {
    if(err || !user){
      req.flash('error', 'Error: User not found');
      res.redirect('back');
    } else{
      Landscape.find().where('author.id').equals(user._id).exec((err, landscapes) => {
        if(err){
          req.flash('error', 'Error: Landscapes not found');
          res.redirect('back');
        }
        res.render('users/show', { user: user, landscapes: landscapes });
      }); 
    }
  });
};

// Handle user update on PUT.
exports.userUpdate = function(req, res){
  if(req.query.tab === 'password'){
    if(req.body.newpass === req.body.confirm){
      User.findById(req.params.id, (err, user) => {
        if(err || !user){
          req.flash('error', err.message);
          res.redirect('back');
        } else{
          user.validPassword(req.body.oldpass, (err, isMatch) => {
            if(isMatch){
              user.password = req.body.newpass;
              user.save();
              req.flash('success', 'Password updated!');
              res.redirect('back');
            } else{
              req.flash('error', 'Password Incorrect');
              res.redirect('back');
            }
          });
        }
      });
    } else{
      req.flash('error', 'Password don\'t match');
      res.redirect('back');
    }
  } else if(req.query.tab === 'info'){
    User.findByIdAndUpdate(req.params.id, req.body.user, (err, user) => {
      if(err){
        req.flash('error', err.message);
        res.redirect('/users/' + user._id);
      } else{
        req.flash('success', 'The user was updated');
        res.redirect('/users/' + user._id);
      }
    });
  }
};