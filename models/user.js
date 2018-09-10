const mongoose = require('mongoose');
const bcrypt   = require('bcrypt');

// SCHEMA SET UP
var userSchema = new mongoose.Schema({
  email: { type: String, required: true },
  password: String,
  username: { type: String, unique: true, required: true },
  fullname: String,
  provider: String,
  avatar: String,
  socialId: String,
  socialToken : String,
  resetPasswordToken: String,
  resetPasswordExpires: Date,
  isAdmin: { type: Boolean, default: false }
});

// Generating a hash
userSchema.pre('save', function(next){
  let user = this;
  const SALT_FACTOR = 5;
  if(!user.isModified('password') || !user.password) return next();
  bcrypt.genSalt(SALT_FACTOR, (err, salt) => {
    if(err) return next(err);
    bcrypt.hash(user.password, salt, (err, hash) => {
      if (err) return next(err);
      user.password = hash;
      next();
    });
  });
});

// Checking if password is valid
userSchema.methods.validPassword = function(candidatePassword, cb){
  bcrypt.compare(candidatePassword, this.password, function(err, isMatch) {
    if (err) return cb(err);
    cb(null, isMatch);
  });
};

module.exports = mongoose.model('User', userSchema);