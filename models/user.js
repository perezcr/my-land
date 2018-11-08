const mongoose = require('mongoose');
const bcrypt   = require('bcrypt');

// SCHEMA SET UP
var userSchema = new mongoose.Schema({
  email: { type: String, required: true },
  username: { type: String, unique: true, required: true },
  password: String,
  fullname: String,
  aboutme: String,
  provider: String,
  avatar: { 
    id: { type: String, default: 'default-avatar' },
    content: {
      type: String,
      default: 'https://res.cloudinary.com/cristian7x/image/upload/v1538108498/myland/avatar/default-avatar.png'
    }
  },
  socialId: String,
  socialToken : String,
  resetPasswordToken: String,
  resetPasswordExpires: Date,
  isAdmin: { type: Boolean, default: false },
  notifications: [ { type: mongoose.Schema.Types.ObjectId, ref: 'Notification' } ],
  followers: [ { type: mongoose.Schema.Types.ObjectId, ref: 'User'} ],
  following: [ { type: mongoose.Schema.Types.ObjectId, ref: 'User'} ]
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
userSchema.methods.validPassword = function(candidatePassword){
  return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);