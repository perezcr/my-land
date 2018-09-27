const express     = require('express');
const router      = express.Router();

const middleware  = require('../middleware');
const userController  = require('../controllers/userController');
const multer          = require('../config/multer');

// SHOW ROUTE
router.get('/:id', middleware.isLoggedIn, userController.userShow);

// UPDATE ROUTE
router.put('/:id', middleware.isLoggedIn, multer.single('avatar'), userController.userUpdate);

module.exports = router;