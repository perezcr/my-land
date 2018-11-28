const passport = require('passport');
const mongoose = require('mongoose');
const User = mongoose.model('User');
const FacebookStrategy = require('passport-facebook').Strategy;
const GoogleStrategy = require('passport-google-oauth20').Strategy;

const { registerSocial } = require('../controllers/userController');

passport.use(User.createStrategy());

// In order to restore authentication state across HTTP requests, Passport needs
// to serialize users into and deserialize users out of the session.  The
// typical implementation of this is as simple as supplying the user ID when
// serializing, and querying the user record by ID from the database when
// deserializing.
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

passport.use(new FacebookStrategy({
  clientID: process.env.APP_ID_FB,
  clientSecret: process.env.APP_SECRET_FB,
  callbackURL: `${process.env.HOST}/auth/facebook/callback`,
  profileFields: ['id', 'name', 'email', 'picture{url}']
}, registerSocial));

passport.use(new GoogleStrategy({
  clientID: process.env.APP_ID_GOOGLE,
  clientSecret: process.env.APP_SECRET_GOOGLE,
  callbackURL: `${process.env.HOST}/auth/google/callback`
}, registerSocial));