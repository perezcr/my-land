const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');
const passportLocalMongoose = require('passport-local-mongoose');

// SCHEMA SET UP
const userSchema = new mongoose.Schema({
  email: { 
    type: String,
    unique: true,
    lowercase: true,
    trim: true,
    required: 'You must supply an email!'
  },
  username: { 
    type: String, 
    unique: true, 
    required: 'You must supply an username!'
  },
  avatar: { 
    id: { type: String, default: 'default-avatar' },
    content: {
      type: String,
      default: 'https://res.cloudinary.com/cristian7x/image/upload/v1538108498/myland/avatar/default-avatar.png'
    }
  },
  fullname: String,
  aboutme: String,
  provider: String,
  socialId: String,
  socialToken : String,
  resetPasswordToken: String,
  resetPasswordExpires: Date,
  isAdmin: { 
    type: Boolean, 
    default: false 
  },
  notifications: [
    { type: mongoose.Schema.Types.ObjectId, ref: 'Notification' }
  ],
  followers: [ 
    { type: mongoose.Schema.Types.ObjectId, ref: 'User' } 
  ],
  following: [ 
    { type: mongoose.Schema.Types.ObjectId, ref: 'User' } 
  ]
});

userSchema.plugin(passportLocalMongoose, { usernameField: 'email', errorMessages: {
  IncorrectPasswordError: 'Password is incorrect! 🚫',
  IncorrectUsernameError: 'Email is incorrect! 🚫',
  MissingUsernameError: 'No email was given! 🚫',
  MissingPasswordError: 'No password was given! 🚫',
  UserExistsError : 'A user with the given email is already registered! 🚫'
}});
// This makes error handling much easier, since you will get a Mongoose validation error when you attempt to violate a unique constraint, rather than an E11000 error from MongoDB.
userSchema.plugin(uniqueValidator, { message: 'A user with the given {PATH} is already registered! 🚫' });

module.exports = mongoose.model('User', userSchema);