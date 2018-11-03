const User        = require('../models/user');
const Landscape   = require('../models/landscape');
const cloudinary  = require('../config/cloudinary');

// Display detail page for a specific user on GET
exports.userShow = function(req, res){
  User.findById(req.params.id, (err, user) => {
    if(err || !user){
      req.flash('error', 'Error: User not found');
      return res.redirect('back');
    } else{
      Landscape.find().where('author.id').equals(user._id).exec((err, landscapes) => {
        if(err){
          req.flash('error', 'Error: Landscapes not found');
          return res.redirect('back');
        }
        res.render('users/show', { user: user, landscapes: landscapes });
      }); 
    }
  });
};

exports.userEdit = function(req, res){
  User.findById(req.params.id, (err, user) => {
    if(err || !user){
      req.flash('error', 'Error: User not found');
      return res.redirect('back');
    } else{
      Landscape.find().where('author.id').equals(user._id).exec((err, landscapes) => {
        if(err){
          req.flash('error', 'Error: Landscapes not found');
          return res.redirect('back');
        }
        res.render('users/edit', { user: user, landscapes: landscapes });
      }); 
    }
  });
};

// Handle user update on PUT.
exports.userUpdate = function(req, res){
  console.log('***************+');
  User.findOneAndUpdate({ _id: req.params.id }, req.body.user, (err, user) => {
    if(err){
      req.flash('error', err.message);
      return res.redirect('back');
    }
    req.flash('success', 'The user was updated');
    res.redirect('back');
  });
};

exports.userUpdateAvatar = function(req, res){
  User.findById(req.params.id, async function(err, user){
    if(err){
      req.flash('error', err.message);
      return res.redirect(`/users/${user._id}`);
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
      req.flash('success', 'The avatar was updated');
      res.redirect('back');
    }
  });
};

exports.userUpdatePassword = function(req, res){
  if(req.body.new === req.body.retypeNew){
    User.findById(req.params.id, (err, user) => {
      if(err || !user) {
        req.flash('error', err.message);
        return res.redirect('back');
      } else{
        user.validPassword(req.body.current, (err, isMatch) => {
          if(isMatch){
            user.password = req.body.new;
            user.save();
            req.flash('success', 'Password updated!');
            return res.redirect('back');
          } else{
            req.flash('error', 'Password Incorrect');
            return res.redirect('back');
          }
        });
      }
    });
  } else{
    req.flash('error', 'New password don\'t match');
    return res.redirect('back');
  } 
};