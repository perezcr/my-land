const User        = require('../models/user');
const Landscape   = require('../models/landscape');
const cloudinary  = require('../config/cloudinary');

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
        if(err || !user) {
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
    User.findById(req.params.id, function(err, user){
      if(err){
        req.flash('error', err.message);
        return res.redirect(`/users/${user._id}`);
      }
      user.email = req.body.email;
      user.username = req.body.username;
      user.fullname = req.body.fullname;
      user.save(async function(err, user){
        if(err){
          req.flash('error', err.message);
          return res.redirect('back');
        }
        if(req.file){
          try {
            if(user.avatar.id !== 'default-avatar')
              await cloudinary.uploader.destroy(user.avatar.id);
            let result = await cloudinary.uploader.upload(req.file.path, {folder: 'myland/avatar'});
            user.avatar = {
              id: result.public_id,
              content: result.secure_url
            };
            user.save();              
          } catch(err) {
            req.flash('error', err.message);
            return res.redirect('back');
          }
        }
        req.flash('success', 'The user was updated');
        res.redirect(`/users/${user._id}`);
      });
    });
  }
};