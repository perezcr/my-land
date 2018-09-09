const Landscape = require('../models/landscape');
const geocoder  = require('mapbox-geocoding');

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
exports.landscapeNew = function(req, res){
  res.render("landscapes/new");
};

// Handle landscape create on POST
exports.landscapeCreate = function(req, res){
  // get data from form and add to landscapes array
  geocoder.setAccessToken(process.env.ACCESS_TOKEN);
  geocoder.geocode('mapbox.places', req.body.landscape.location, (err, geoData) => {
    if (err || !geoData.features.length) {
      console.log(err);
      req.flash('error', 'Location not valid');
      return res.redirect('back');
    }
    Landscape.create(req.body.landscape, (err, landscape) => {
      if(err){
        req.flash('error', 'Missing name, image or location');
        res.redirect("/landscapes/new");
      } else{
        [landscape.lng, landscape.lat] = geoData.features[0].center;
        landscape.author.id = req.user._id;
        landscape.author.username = req.user.username;
        landscape.save();
        // redirect back to landscapes page
        req.flash('success', 'Landscape was created')
        res.redirect("/landscapes");
      }
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
      res.render('landscapes/show', { landscape: landscape, key: process.env.ACCESS_TOKEN });
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
  geocoder.setAccessToken(process.env.ACCESS_TOKEN);
  geocoder.geocode('mapbox.places', req.body.landscape.location, (err, geoData) => {
    if (err || !geoData.features.length) {
      req.flash('error', 'Location not valid');
      return res.redirect('back');
    }
    [req.body.landscape.lng, req.body.landscape.lat] = geoData.features[0].center;

    Landscape.findByIdAndUpdate(req.params.id, req.body.landscape, (err, landscape) => {
      if(err){
        req.flash('error', err.message);
        res.redirect('/landscapes');
      } else{
        req.flash('success', 'The landscape was updated');
        res.redirect('/landscapes/' + landscape._id);
      }
    });
  });
};

// Handle landscape delete on DELETE.
exports.landscapeDestroy = function(req, res){
  Landscape.findByIdAndRemove(req.params.id, (err) => {
    if(err){
      req.flash('error', err);
      res.redirect('/landscapes');
    } else {
      req.flash('success', 'The landscape was deleted');
      res.redirect('/landscapes');
    }
  });
};