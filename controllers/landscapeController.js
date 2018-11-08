const Landscape     = require('../models/landscape');
const User          = require('../models/user');
const Notification  = require('../models/notification');
const geocoder      = require('mapbox-geocoding');
const cloudinary    = require('../config/cloudinary');

// Geocoder Configuration
geocoder.setAccessToken(process.env.GEOCODER_TOKEN);

// Display all landscapes on GET
exports.landscapeIndex = function(req, res){
  Landscape.find({}, (err, landscapes) => {
    if(err){
      console.log(err);
    } else{
      res.render("landscapes/index", { landscapes: landscapes, page: 'landscapes'});
    }
  });
};

// Display landscape new form on GET
exports.landscapeNew = (req, res) => res.render("landscapes/new");

// Handle landscape create on POST
exports.landscapeCreate = function(req, res){
  // ****** GEOCODER ******
  // Get data from form and add to landscapes array
  geocoder.geocode('mapbox.places', req.body.landscape.location, async function(err, geoData){
    try {
      if(err){
        req.flash('error', err.message);
        res.redirect('back');
      }
      if (!geoData.features.length) {
        req.flash('error', 'Location not valid');
        return res.redirect('back');
      }
      [req.body.landscape.lng, req.body.landscape.lat] = geoData.features[0].center;

      let result = await cloudinary.uploader.upload(req.file.path, {folder: 'myland/landscape'});
      // add cloudinary url for the image to the landscape object under image property
      req.body.landscape.image = {
        id: result.public_id,
        content: result.secure_url
      };
      // add author to campground
      req.body.landscape.author = {
        id: req.user._id,
        username: req.user.username
      };

      const landscapePromise = Landscape.create(req.body.landscape);
      const userPromise = User.findById(req.user._id).populate('followers').exec();

      const [landscape, user] = await Promise.all([landscapePromise, userPromise]);
      for(const follower of user.followers) {
        let notification = await Notification.create({
          username: user.username,
          avatar: user.avatar.content,
          type: 'Landscape',
          landscapeId: landscape._id
        });
        follower.notifications.push(notification);
        follower.save();
      }
      // redirect back to landscapes page
      req.flash('success', 'Landscape was created');
      res.redirect(`/landscapes/${landscape.id}`);       
    } catch (err) {
      req.flash('error', err.message);
      res.redirect('back');  
    }
  });
};

// Display detail page for a specific landscape on GET
exports.landscapeShow = function(req, res){
  // Find the landscape with provided ID
  Landscape.findById(req.params.id).populate('comments').exec(function(err, landscape){
    if(err || !landscape){
      req.flash('error', 'Landscape not found');
      res.redirect("/landscapes");
    } else{
      res.render('landscapes/show', { landscape: landscape, key: process.env.GEOCODER_TOKEN });
    }
  });
};

// Display landscape update form on GET
exports.landscapeEdit = function(req, res){
  Landscape.findById(req.params.id, (err, landscape) => {
    res.render('landscapes/edit', { landscape: landscape });   
  });
};

// Handle landscape update on PUT.
exports.landscapeUpdate = function(req, res){ 
  Landscape.findById(req.params.id, function(err, landscape){  
    if(err){
      req.flash('error', err.message);
      return res.redirect('back');
    }
    geocoder.geocode('mapbox.places', req.body.location, async function(err, geoData){
      if (err || !geoData.features.length) {
        req.flash('error', 'Location not valid');
        return res.redirect('back');
      }
      if(req.file){
        try {
          await cloudinary.uploader.destroy(landscape.image.id);
          let result = await cloudinary.uploader.upload(req.file.path, {folder: 'myland/landscape'});
          landscape.image = {
            id: result.public_id,
            content: result.secure_url
          };
        } catch(err) {
          req.flash('error', err.message);
          return res.redirect('back');
        }
      }
      landscape.name = req.body.name;
      landscape.entranceFee = req.body.entranceFee;
      landscape.location = req.body.location;
      [landscape.lng, landscape.lat] = geoData.features[0].center;
      landscape.description = req.body.description;
      landscape.save();
      req.flash('success', 'The landscape was updated');
      res.redirect('/landscapes/' + landscape._id);
    });
  });
};

// Handle landscape delete on DELETE.
exports.landscapeDestroy = function(req, res){
  Landscape.findById(req.params.id, async function(err, landscape){
    if(err){
      req.flash('error', err.message);
      return res.redirect('/landscapes');
    }
    try {
      await cloudinary.uploader.destroy(landscape.image.id);
      landscape.remove();
      req.flash('success', 'The landscape was deleted');
      res.redirect('/landscapes');
    } catch (error) {
      req.flash("error", err.message);
      return res.redirect("back");
    }
  });
};