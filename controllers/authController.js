const passport = require('passport');
const mongoose = require('mongoose');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const User = mongoose.model('User');

exports.login = passport.authenticate('local', {
  successRedirect: '/landscapes',
  successFlash: 'You are now logged in! 🔥',
  failureRedirect: '/login',
  failureFlash: 'Email or password is incorrect! 🚫'
});

exports.logout = (req, res) => {
  req.logout();
  req.flash('success', 'You are now logged out! 👋');
  res.redirect('/landscapes');
};

exports.isLoggedIn = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next(); // carry on! They are logged in!
  }
  req.flash('error', 'You need to be logged in! 🚫');
  res.redirect('/login');
};

exports.facebook = passport.authenticate('facebook', { 
  // authType: 'rerequest', // Re-ask for declined permissions
  scope: ['email'] // Permissions
});

// Handle the callback after facebook has authenticated the user
// Facebook will redirect the user to this URL after approval. Finish the
// authentication process by attempting to obtain an access token.  If
// access was granted, the user will be logged in.  Otherwise,
// authentication has failed.
// Note that the URL of the callback route matches that of the callbackURL option specified when configuring the strategy.
exports.facebookCb = passport.authenticate('facebook', {
  successRedirect: '/landscapes',
  successFlash: 'You are now logged in with Facebook! 🔥',
  failureRedirect: '/login',
  failureFlash: 'Failed Login! 🚫'
});

exports.google = passport.authenticate('google', { 
  scope: ['profile', 'email'] 
});

// the callback after google has authenticated the user
exports.googleCb = passport.authenticate('google', {
  successRedirect : '/landscapes',
  successFlash: 'You are now logged in with Google! 🔥',
  failureRedirect : '/login',
  failureFlash: 'Failed Login! 🚫'
});

// Handle forgot password on POST
exports.forgot = async (req, res) => {
  // 1. See if a user with that email exists
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    req.flash('error', 'No account with provided email 🚫');
    return res.redirect('/login');
  }
  // 2. Set reset tokens and expiry on their account
  user.resetPasswordToken = crypto.randomBytes(20).toString('hex'); // Generate token   
  user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
  await user.save();
  // 3. Send them an email with the token
  const resetURL = `https://${req.headers.host}/users/reset/${user.resetPasswordToken}`;
  const transport = nodemailer.createTransport({
    service: 'Gmail',
    port: 465,
    auth: {
      user: 'mylandweb@gmail.com',
      pass: process.env.GMAIL_PW
    }
  });
  const mailOptions = {
    to: user.email,
    from: 'mylandweb@gmail.com',
    subject: 'MyLand: Password Reset',
    text: `You are receiving this because you have requested the reset of the password for your account.\n
    Please click on the following link, or paste this into your browser to complete the process:\n
    ${resetURL}\n
    If you did not request this, please ignore this email and your password will remain unchanged.\n
    MyLand`
  };
  await transport.sendMail(mailOptions);
  // 4. redirect to login page
  req.flash('success', 'You have been emailed a password reset link! ✅')
  res.redirect('/login');
};

exports.reset = async function(req, res){
  const user = await User.findOne({ 
    resetPasswordToken: req.params.token, 
    resetPasswordExpires: { $gt: Date.now() }  //$gt -> greater
  });
  if (!user) {
    req.flash('error', 'Password reset token is invalid or has expired 🚫');
    return res.redirect('back');
  }
  // if there is a user, show the rest password form
  res.render('reset', { token: req.params.token })
}; 

exports.confirmPassword = (req, res, next) => {
  if (req.body.newPassword === req.body.confirm) {
    return next();
  }
  req.flash('error', 'Passwords do not match! 🚫');
  res.redirect('back'); 
};

exports.update = async (req, res) => {
  const user = await User.findOne({ 
    resetPasswordToken: req.params.token, 
    resetPasswordExpires: { $gt: Date.now() } 
  });
  if (!user) {
    req.flash('error', 'Password reset token is invalid or has expired 🚫');
    return res.redirect('back');
  }
  await user.setPassword(req.body.newPassword);
  user.resetPasswordToken = undefined;
  user.resetPasswordExpires = undefined;

  const updated = await user.save();
  req.logIn(updated, () => {
    req.flash('success', 'Your password has been reset! You are now logged in! 🔥'); 
    res.redirect('/landscapes');
  }); 
};