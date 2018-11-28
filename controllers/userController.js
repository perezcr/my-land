const mongoose = require('mongoose');
const User = mongoose.model('User');
const Notification = mongoose.model('Notification');
const Landscape = mongoose.model('Landscape');
const cloudinary = require('../handlers/cloudinary');

// Display landing
exports.landing = (req, res) => res.render('landing');

// Display the signup form
exports.registerForm = (req, res) => res.render('signup', { page: 'signup' });

exports.register = async (req, res, next) => {
  const user = new User({ 
    email: req.body.email,
    username: req.body.username,
    fullname: req.body.fullName,
    provider: 'local',
    isAdmin: req.body.isAdmin === process.env.ADMIN_CODE ? true : false
  });
  await User.register(user, req.body.password);
  next(); 
};

exports.registerSocial = async (accessToken, refreshToken, profile, done) => {
  // find the user in the database based on their social id
  const user = await User.findOne({ 'socialId': profile.id });
  // if the user is found, then log them in
  if (user) {
    return done(null, user);
  }
  // if there is no user found with that social id, create them
  const newUser = await User.create({
    socialId: profile.id, // set the users social id 
    socialToken: accessToken, // save the token that social provides to the user
    provider: profile.provider,
    email: profile.emails[0].value, // social can return multiple emails so we'll take the first
    fullname: profile.provider === 'facebook' ? `${profile.name.givenName} ${profile.name.familyName}` : profile.displayName,
    username: profile.provider === 'facebook' ? `${profile.name.givenName}${profile.id.substr(0, 6)}` : `${profile.displayName.split(' ')[0]}${profile.id.substr(0, 6)}`
  });
  // if successful, return the new user
  done(null, newUser);
};

// Display login form
exports.loginForm = (req, res) => res.render('login', { page: 'login' });

// Display detail page for a specific user on GET
exports.profile = async (req, res) => {
  const userPromise = User.findById(req.params.id);
  const landscapesPromise = Landscape.find().where('author').equals(req.params.id);
  const [user, landscapes] = await Promise.all([userPromise, landscapesPromise]);
  if (!user) {
    req.flash('error', 'User not found ❌');
    return res.redirect('back');
  }
  res.render('users/show', { user, landscapes });
};

exports.editForm = async (req, res) => {
  const user = await User.findById(req.params.id);
  res.render('users/edit', { user });
};

// Handle user update on PUT.
exports.updateUser = async (req, res) => {
  const user = await User.findOneAndUpdate({ _id: req.params.id }, req.body.user, { new: true, runValidators: true, context: 'query' });
  req.flash('success', 'The user was updated ✅');
  res.redirect(`/users/${user._id}`);
};

exports.updateAvatar = async (req, res) => {
  if (!req.file) {
    req.flash('error', 'You must supply an image! ❌');
    return res.redirect('back');
  }
  const user = await User.findById(req.params.id);
  if (!user) {
    req.flash('error', 'User not found ❌');
    return res.redirect('back');
  }
  if (user.avatar.id !== 'default-avatar')
    await cloudinary.uploader.destroy(user.avatar.id);
  const { public_id, secure_url } = await cloudinary.uploader.upload(req.file.path, { folder: 'myland/avatar' });
  user.avatar = {
    id: public_id,
    content: secure_url
  };
  await user.save();                   
  req.flash('success', 'The avatar was updated ✅');
  res.redirect('back');
};

exports.updatePassword = async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    req.flash('error', 'User not found ❌');
    return res.redirect('back');
  }
  await user.changePassword(req.body.current, req.body.newPassword);
  req.flash('success', 'Password updated! ✅');
  res.redirect(`/users/${user._id}`);  
};

exports.follow = async function(req, res){
  // The $addToSet operator adds a value to an array unless the value is already present, in which case $addToSet does nothing to that array.
  const userFollowing = await User.findOneAndUpdate({ _id: req.params.id }, { $addToSet: { followers: req.user._id } }, { new: true });
  const userFollower = await User.findOneAndUpdate({ _id: req.user._id }, { $addToSet: { following: req.params.id } }, { new: true });
  const notification = await Notification.create({
    user: userFollower._id,
    type: 'Follow',
  });
  userFollowing.notifications.push(notification);
  await userFollowing.save();
  res.redirect('back');
};

exports.unfollow = async function(req, res){
  // The $pull operator removes from an existing array all instances of a value or values that match a specified condition.
  await User.findOneAndUpdate({ _id: req.params.id }, { $pull: { followers: req.user._id } });
  await User.findOneAndUpdate({ _id: req.user._id }, { $pull: { following: req.params.id } });
  res.redirect('back');
};

exports.checkUserOwnership = async (req, res, next) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    req.flash('error', 'User not found ❌');
    return res.redirect('/landscapes');
  }
  if (user._id.equals(req.user._id)) {
    return next();
  }
  req.flash('error', 'You don\'t have permission 🚫');
  res.redirect('/landscapes');
};