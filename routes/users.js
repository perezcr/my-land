const express     = require('express');
const router      = express.Router();

const middleware  = require('../middleware');
const userController  = require('../controllers/userController');
const multer          = require('../config/multer');

// SHOW ROUTE
router.get('/:id', middleware.isLoggedIn, userController.userShow);

// EDIT ROUTE
router.get('/:id/edit', middleware.isLoggedIn, userController.userEdit);

// UPDATE ROUTE
router.put('/:id', middleware.isLoggedIn,  userController.userUpdate);
router.put('/:id/avatar', middleware.isLoggedIn, multer.single('avatar'), userController.userUpdateAvatar);
router.put('/:id/password', middleware.isLoggedIn, userController.userUpdatePassword);

module.exports = router;