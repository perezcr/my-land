const LocalStrategy     = require('passport-local').Strategy;
const FacebookStrategy  = require('passport-facebook').Strategy;
const GoogleStrategy    = require('passport-google-oauth20').Strategy;

const configAuth        = require('./auth');
const User              = require('../models/user');

module.exports = function (passport) {

  // Configure Passport authenticated session persistence.
  //
  // In order to restore authentication state across HTTP requests, Passport needs
  // to serialize users into and deserialize users out of the session.  The
  // typical implementation of this is as simple as supplying the user ID when
  // serializing, and querying the user record by ID from the database when
  // deserializing.
  passport.serializeUser(function (user, done) {
    done(null, user.id);
  });

  passport.deserializeUser(function (id, done) {
    User.findById(id, function (err, user) {
      done(err, user);
    });
  });

  // LOCAL SIGNUP
  // 
  // We are using named strategies since we have one for login and one for signup
  // by default, if there was no name, it would just be called 'local'
  passport.use('local-signup', new LocalStrategy({
    // by default, local strategy uses username and password, we will override with email
    usernameField: 'email',
    passwordField: 'password',
    passReqToCallback: true // allows us to pass back the entire request to the callback
  },
    async function (req, email, password, done) {
      try {
        // Check to see if theres already a user with that email
        let user = await User.findOne({ 'email': email, 'provider': 'local' });
        if(user) {
          return done(null, false, req.flash('error', 'That email is already taken.'));
        }
        let newUser = await User.create({
          email: email,
          username: req.body.username,
          fullname: req.body.fullname,
          provider: 'local',
          password: password,
          isAdmin: req.body.isAdmin === process.env.ADMIN_CODE ? true : false
        });
        req.flash('success', 'Successfully Signed Up!');
        return done(null, newUser);
      } catch (err) {
        if(err.name === 'MongoError') {
          return done(null, false, req.flash('error', 'That username is already taken.'));
        }
        done(null, false, req.flash('error', err.message));   
      }
    }
  ));

  // LOCAL LOGIN
  //
  // We are using named strategies since we have one for login and one for signup
  // by default, if there was no name, it would just be called 'local'
  passport.use('local-login', new LocalStrategy({
    // by default, local strategy uses username and password, we will override with email
    usernameField: 'email',
    passwordField: 'password',
    passReqToCallback: true // allows us to pass back the entire request to the callback
  },
    async function (req, email, password, done) { // callback with email and password from our form
      try {
        let user = await User.findOne({ 'email': email, 'provider': 'local' });
        // if no user is found
        if(!user) {
          return done(null, false, req.flash('error', 'Incorrect username.'));
        }
        const isMatch = await user.validPassword(password);
        // if the user is found but the password is wrong
        if(!isMatch) {
          return done(null, false, req.flash('error', 'Incorrect password.'));
        }
        done(null, user, req.flash('success', 'Welcome!'));       
      } catch (err) {
        done(null, false, req.flash('error', err.message));  
      }
    }
  ));

  // FACEBOOK LOGIN
  //
  passport.use(new FacebookStrategy({
    // pull in our app id and secret from our auth.js file
    clientID: configAuth.facebookAuth.clientID,
    clientSecret: configAuth.facebookAuth.clientSecret,
    callbackURL: configAuth.facebookAuth.callbackURL,
    profileFields: configAuth.facebookAuth.profileFields
  },
    // facebook will send back the token and profile
    async function (accessToken, refreshToken, profile, done) {
      try {
        // find the user in the database based on their facebook id
        let user = await User.findOne({ 'socialId': profile.id });
        // if the user is found, then log them in
        if(user) {
          return done(null, user);
        }
        // if there is no user found with that facebook id, create them
        let newUser = await User.create({
          socialId: profile.id, // set the users facebook id 
          socialToken: accessToken, // save the token that facebook provides to the user
          provider: profile.provider,
          email: profile.emails[0].value, // facebook can return multiple emails so we'll take the first
          fullname: profile.name.givenName + " " + profile.name.familyName,
          username: profile.name.givenName + profile.id.substr(0, 6),
          avatar: profile.photos[0].value
        });
        // if successful, return the new user
        done(null, newUser);
      } catch (err) {
        console.log(err);
        done(err);
      }  
    }
  ));

  // GOOGLE LOGIN
  //
  passport.use(new GoogleStrategy({
    clientID: configAuth.googleAuth.clientID,
    clientSecret: configAuth.googleAuth.clientSecret,
    callbackURL: configAuth.googleAuth.callbackURL
  },
    async function (accessToken, refreshToken, profile, done) {
      try {
        // find the user in the database based on their google id
        let user = await User.findOne({ 'socialId': profile.id });
        // if the user is found, then log them in
        if(user) {
          return done(null, user);
        }
        // if there is no user found with that google id, create them
        let newUser = await User.create({
          socialId: profile.id, // set the users google id 
          socialToken: accessToken, // save the token that google provides to the user
          provider: profile.provider,
          email: profile.emails[0].value,
          fullname: profile.displayName,
          username: profile.displayName.split(' ')[0] + profile.id.substr(0, 6),
          avatar: profile.photos[0].value
        });
        // if successful, return the new user
        done(null, newUser);
      } catch (err) {
        console.log(err);
        done(err);
      }     
    }
  ));
}