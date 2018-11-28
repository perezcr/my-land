const mongoose = require('mongoose');
const Landscape = mongoose.model('Landscape');
const User = mongoose.model('User');
const Notification = mongoose.model('Notification');
const cloudinary = require('../handlers/cloudinary');

// Display all landscapes on GET
exports.getLandscapes = async (req, res) => {
  const landscapes = await Landscape.find({});
  res.render("landscapes/index", { landscapes, page: 'landscapes'});
};

// Display landscape new form on GET
exports.addLandscapeForm = (req, res) => res.render("landscapes/new", { key: process.env.GEOCODER_TOKEN });

// Handle landscape create on POST
exports.createLandscape = async (req, res) => {
  const { public_id, secure_url } = await cloudinary.uploader.upload(req.file.path, {folder: 'myland/landscape'});
  req.body.landscape.author = req.user._id;
  req.body.landscape.image = { id: public_id, content: secure_url };

  const landscapePromise = Landscape.create(req.body.landscape);
  const userPromise = User.findById(req.user._id).populate('followers');
  const [landscape, user] = await Promise.all([landscapePromise, userPromise]);
  for (let follower of user.followers) {
    const notification = await Notification.create({
      user: user._id,
      type: 'Landscape',
      landscape: landscape._id
    });
    follower.notifications.push(notification);
    await follower.save();
  }
  // redirect back to landscapes page
  req.flash('success', 'Landscape was created ✅');
  res.redirect(`/landscapes/${landscape.id}`);
};

// Display detail page for a specific landscape on GET
exports.showLandscape = async (req, res) => {
  const landscape = await Landscape.findById(req.params.id).populate({
    path: 'comments',
    populate: { path: 'author' }
  }).populate({
    path: 'reviews',
    populate: { path: 'author' },
    options: { sort: { createdAt: -1 }}
  });
  if (!landscape) {
    req.flash('error', 'Landscape not found ❌');
    return res.redirect("/landscapes");
  }
  res.render('landscapes/show', { landscape, key: process.env.GEOCODER_TOKEN });
};

// Display landscape update form on GET
exports.editLandscapeForm = async (req, res) => {
  const landscape = await Landscape.findById(req.params.id);
  res.render('landscapes/edit', { landscape, key: process.env.GEOCODER_TOKEN });   
};

// Handle landscape update on PUT.
exports.updateLandscape = async (req, res) => {
  if (req.file) {
    await deleteUploadedImage(req.params.id);
    const { public_id, secure_url} = await cloudinary.uploader.upload(req.file.path, { folder: 'myland/landscape' });
    req.body.landscape.image = { id: public_id, content: secure_url };
  }
  const landscape = await Landscape.findOneAndUpdate({ _id: req.params.id }, { $set: req.body.landscape }, { 
    new: true, 
    runValidators: true 
  }).exec();
  req.flash('success', 'The landscape was updated ✅');
  res.redirect(`/landscapes/${landscape._id}`);
};

// Handle landscape delete on DELETE.
exports.deleteLandscape = async (req, res) => {
  const landscape = await Landscape.findById(req.params.id);
  await landscape.remove();
  req.flash('success', 'The landscape was deleted ✅');
  res.redirect('/landscapes');
};

// Middleware check ownership
exports.checkLandscapeOwnership = async (req, res, next) => { 
  const landscape = await Landscape.findById(req.params.id);
  if (!landscape) {
    req.flash('error', 'Landscape not found ❌');
    return res.redirect('/landscapes');
  }
  if (landscape.author.equals(req.user._id) || req.user.isAdmin) {
    return next();
  }
  req.flash('error', 'You don\'t have permission 🚫');
  res.redirect('/landscapes');
};

// Delete uploaded image from cloudinary
function deleteUploadedImage(id){
  return new Promise((resolve, reject) => {
    Landscape.findById(id).then(landscape => {
      resolve(cloudinary.uploader.destroy(landscape.image.id));  
    });   
  });
};