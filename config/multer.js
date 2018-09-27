const multer = require('multer');

// Configuration
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

module.exports = multer({ storage: storage, fileFilter: imageFilter });