const passport    = require('passport');
const crypto      = require('crypto');
const async       = require('async');
const nodemailer  = require('nodemailer');

const User = require('../models/user');

// Display landing
exports.indexLanding = function(req, res){
  res.render('landing');
};

// Display the signup form
exports.indexSignUpGet = function(req, res){
  res.render('signup', { page: 'signup' });
};

// Handle signup logic
exports.indexSignUpPost = passport.authenticate('local-signup', {
  successRedirect: '/landscapes',
  failureRedirect: '/signup',
  badRequestMessage: 'Missing email or password',
  failureFlash: true // allow flash messages
});

// Display login form
exports.indexLoginGet = function(req, res){
  res.render('login', { page: 'login' });
};

// Handle login logic
exports.indexLoginPost = passport.authenticate('local-login', {
  successRedirect: '/landscapes',
  failureRedirect: '/login',
  badRequestMessage: 'Missing email or password',
  failureFlash: true // allow flash messages
});

exports.indexAuthFb = passport.authenticate('facebook', { 
  //authType: 'rerequest', // How do I re-ask for for declined permissions?
  // Permissions
  scope: ['email']
});


// Handle the callback after facebook has authenticated the user
// Facebook will redirect the user to this URL after approval. Finish the
// authentication process by attempting to obtain an access token.  If
// access was granted, the user will be logged in.  Otherwise,
// authentication has failed.
// Note that the URL of the callback route matches that of the callbackURL option specified when configuring the strategy.
exports.indexAuthCallbackFb = passport.authenticate('facebook', {
  successRedirect: '/landscapes',
  failureRedirect: 'back',
  failureFlash: true
});

// Display the forgot password form on GET
exports.indexForgotGet = function(req, res){
  res.render('forgot', { user: req.user });
}

// Handle forgot password on POST
exports.indexForgotPost = function(req, res){
  async.waterfall([
    function(done) {
      crypto.randomBytes(20, function(err, buf) {
        const token = buf.toString('hex');
        done(err, token);
      });
    },
    function(token, done) {
      User.findOne({ email: req.body.email }, function(err, user) {
        if (!user) {
          req.flash('error', 'No account with that email address exists.');
          return res.redirect('/forgot');
        }
        user.resetPasswordToken = token;
        user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
        user.save(function(err) {
          done(err, token, user);
        });
      });
    },
    function(token, user, done) {
      const smtpTransport = nodemailer.createTransport({
        service: 'Gmail', 
        auth: {
          user: 'mylandweb@gmail.com',
          pass: process.env.GMAIL_PW
        }
      });
      const mailOptions = {
        to: user.email,
        from: 'mylandweb@gmail.com',
        subject: 'MyLand: Password Reset',
        text: 'You are receiving this because you have requested the reset of the password for your account.\n\n' +
        'Please click on the following link, or paste this into your browser to complete the process:\n\n' +
        'https://' + req.headers.host + '/reset/' + token + '\n\n' +
        'If you did not request this, please ignore this email and your password will remain unchanged.\n' +
        'MyLand'
      };
      smtpTransport.sendMail(mailOptions, function(err) {
        console.log('Mail Sent!');
        req.flash('success', 'An e-mail has been sent to ' + user.email + ' with further instructions.');
        done(err, 'done');
      });
    }
  ],
  function(err) {
    if (err) return next(err);
    res.redirect('/forgot');
  });
};

exports.indexResetGet = function(req, res){
  User.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } }, function(err, user) { //$gt -> greater
    if (!user) {
      req.flash('error', 'Password reset token is invalid or has expired.');
      return res.redirect('/forgot');
    }
    res.render('reset', { token: req.params.token });
  });
};

exports.indexResetPost = function(req, res){
  async.waterfall([
    function(done) {
      User.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } }, function(err, user) {
        if (!user) {
          req.flash('error', 'Password reset token is invalid or has expired.');
          return res.redirect('back');
        }
        if(req.body.password === req.body.confirm) {
          user.password = req.body.password;
          user.resetPasswordToken = undefined;
          user.resetPasswordExpires = undefined;

          user.save( function(err) {
            req.logIn(user, function(err) {
              done(err, user);
            });
          });     
        } else {
          req.flash("error", "Passwords do not match.");
          return res.redirect('back');
        }
      });
    },
    function(user, done) {
      const smtpTransport = nodemailer.createTransport({
        service: 'Gmail', 
        auth: {
          user: 'mylandweb@gmail.com',
          pass: process.env.GMAIL_PW
        }
      });
      const mailOptions = {
        to: user.email,
        from: 'mylandweb@mail.com',
        subject: 'Your password has been changed',
        text: 'Hello,\n\n' +
        'This is a confirmation that the password for your account ' + user.email + ' has just been changed.\n'
      };
      smtpTransport.sendMail(mailOptions, function(err) {
        req.flash('success', 'Success! Your password has been changed.');
        done(err);
      });
    }
  ], 
  function(err) {
    res.redirect('/landscapes');
  });
};

exports.indexLogout = function(req, res){
  req.logout();
  req.flash('success', 'Logged you out');
  res.redirect('/landscapes');
};