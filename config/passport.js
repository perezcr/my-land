const LocalStrategy     = require('passport-local').Strategy;
const FacebookStrategy  = require('passport-facebook').Strategy;
const configAuth        = require('./auth');
const User              = require('../models/user');

module.exports = function(passport){

  // Configure Passport authenticated session persistence.
  //
  // In order to restore authentication state across HTTP requests, Passport needs
  // to serialize users into and deserialize users out of the session.  The
  // typical implementation of this is as simple as supplying the user ID when
  // serializing, and querying the user record by ID from the database when
  // deserializing.
  passport.serializeUser(function(user, done) {
    done(null, user.id);
  });

  passport.deserializeUser(function(id, done) {
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
    function (req, email, password, done) {
        // asynchronous
        // User.findOne wont fire unless data is sent back
        process.nextTick(() => {
          // find a user whose email is the same as the forms email
          // we are checking to see if the user trying to login already exists
          User.findOne({ 'email': email, 'provider': 'local' }, function (err, user) {       
              // if there are any errors, return the error
              if (err) return done(err);
              // check to see if theres already a user with that email
              if (user) return done(null, false, req.flash('error', 'That email is already taken.'));
              else {
                // if there is no user with that email
                // create the user
                let newUser = new User();
                newUser.email = email;
                newUser.username = req.body.username;
                newUser.fullname = req.body.fullname;
                newUser.provider = 'local';              
                newUser.password = password;
                newUser.avatar = req.body.avatar; 
                if(req.body.isAdmin === process.env.ADMIN_CODE) { newUser.isAdmin = true; }                                           
                // save the user
                newUser.save(function (err) {
                    if (err){
                      if(err.name === 'MongoError')
                          return done(null, false, req.flash('error', 'That username is already taken.'));
                      else
                          return done(null, false, req.flash('error', 'The username is required.'));
                    }           
                    req.flash('success', 'Successfully Signed Up!');
                    return done(null, newUser);
                });
              }
          });
        });
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
      function (req, email, password, done) { // callback with email and password from our form
         // find a user whose email is the same as the forms email
         // we are checking to see if the user trying to login already exists
         User.findOne({ 'email': email, 'provider': 'local' }, function (err, user) {
            // if there are any errors, return the error before anything else
            if (err) return done(err);
            // if no user is found, return the message
            if (!user)
               return done(null, false, req.flash('error', 'Incorrect username.')); // req.flash is the way to set flashdata using connect-flash
            // if the user is found but the password is wrong
            user.validPassword(password, function(err, isMatch){
               if(isMatch) return done(null, user, req.flash('success', 'Welcome!'));
               else{
                  // create the loginMessage and save it to session as flashdata
                  return done(null, false, req.flash('error', 'Incorrect password.'));
               }             
            });
         });
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
      function (accessToken, refreshToken, profile, done) {
         process.nextTick(function () {
            // find the user in the database based on their facebook id
            User.findOne({ 'socialId': profile.id }, function (err, user) {
               // if there is an error, stop everything and return that
               // ie an error connecting to the database
               if (err) { return done(err); }
               // if the user is found, then log them in
               if (user) { return done(null, user); } 
               else {
                  // if there is no user found with that facebook id, create them
                  let newUser = new User();
                  // set all of the facebook information in our user model
                  
                  newUser.socialId = profile.id; // set the users facebook id                   
                  newUser.socialToken = accessToken; // we will save the token that facebook provides to the user
                  newUser.provider = profile.provider;
                  newUser.email = profile.emails[0].value; // facebook can return multiple emails so we'll take the first                   
                  newUser.fullname = profile.name.givenName + " " + profile.name.familyName;
                  newUser.username = newUser.fullname.split(" ")[0] + profile.id.substr(0,6);
                  newUser.avatar = profile.photos[0].value;
                  // save our user to the database
                  newUser.save(function (err) {
                     if (err) { throw err; }
                     // if successful, return the new user
                     return done(null, newUser);
                  });
               }
            });
         });
      }
   ));

}