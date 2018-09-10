module.exports = {
  'facebookAuth': {
    'clientID': process.env.APP_ID_FB, // your App ID
    'clientSecret': process.env.APP_SECRET_FB, // your App Secret
    'callbackURL': process.env.HOST + '/auth/facebook/callback',
    'profileFields': ['id', 'name', 'email', 'picture{url}'] // For requesting permissions from Facebook API
  },

  'googleAuth': {
    'clientID': process.env.APP_ID_GOOGLE,
    'clientSecret': process.env.APP_SECRET_GOOGLE,
    'callbackURL': process.env.HOST + '/auth/google/callback'
  }
};