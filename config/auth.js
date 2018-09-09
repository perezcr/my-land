module.exports = {

   'facebookAuth': {
      'clientID': 'ID', // your App ID
      'clientSecret': 'SECRET', // your App Secret
      'callbackURL': 'CALLBACK',
      'profileFields': ['id', 'name', 'email', 'picture{url}'] // For requesting permissions from Facebook API
   },

   'googleAuth': {
      'clientID': 'ID',
      'clientSecret': 'SECRET',
      'callbackURL': 'https://localhost/auth/google/callback'
   }
};