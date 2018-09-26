const Landscape   = require('../models/landscape');
const geocoder    = require('mapbox-geocoding');
const multer      = require('multer');
const cloudinary  = require('cloudinary');

// Geocoder Configuration
geocoder.setAccessToken(process.env.GEOCODER_TOKEN);

// Multer Configuration
const storage = multer.diskStorage({
  filename: function(req, file, callback){
    callback(null, Date.now() + file.originalname);
  }
});
const imageFilter = function(req, file, callback){
  // accept image files only
  if(!file.originalname.match(/\.(jpg|jpeg|png|gif)$/i)){
    return callback(new Error('Only image files are allowed!'), false);
  }
  callback(null, true);
};
exports.upload = multer({ storage: storage, fileFilter: imageFilter });

// Cloudinary Configuration
cloudinary.config({
  cloud_name: 'cristian7x',
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

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
  cloudinary.v2.uploader.upload(req.file.path, function(err, result){   
    if(err){
      req.flash('error', err.message);
      return res.redirect('back');
    }
    // add cloudinary url for the image to the campground object under image property
    req.body.landscape.image = result.secure_url;
    // add image's public_id to campground object
    req.body.landscape.imageId = result.public_id;
    // add author to campground
    req.body.landscape.author = {
      id: req.user._id,
      username: req.user.username
    }
    // ****** GEOCODER ******
    // Get data from form and add to landscapes array
    geocoder.geocode('mapbox.places', req.body.landscape.location, (err, geoData) => {
      if (err || !geoData.features.length) {
        req.flash('error', 'Location not valid');
        return res.redirect('back');
      }
      [req.body.landscape.lng, req.body.landscape.lat] = geoData.features[0].center;
      Landscape.create(req.body.landscape, (err, landscape) => {
        if(err){
          req.flash('error', 'Missing name, image or location');
          return res.redirect("/landscapes/new");
        }
        // redirect back to landscapes page
        req.flash('success', 'Landscape was created');
        res.redirect(`/landscapes/${landscape.id}`);  
      });
    });
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
          await cloudinary.v2.uploader.destroy(landscape.imageId);
          let result = await cloudinary.v2.uploader.upload(req.file.path);
          landscape.imageId = result.public_id;
          landscape.image = result.secure_url;
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
      await cloudinary.v2.uploader.destroy(landscape.imageId);
      landscape.remove();
      req.flash('success', 'The landscape was deleted');
      res.redirect('/landscapes');
    } catch (error) {
      req.flash("error", err.message);
      return res.redirect("back");
    }
  });
};