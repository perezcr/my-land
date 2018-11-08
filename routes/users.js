const express     = require('express');
const router      = express.Router();

const middleware  = require('../middleware');
const userController  = require('../controllers/userController');
const multer          = require('../config/multer');

// SHOW ROUTE
router.get('/:id', middleware.isLoggedIn, userController.userShow);

// EDIT ROUTE
router.get('/:id/edit', middleware.checkUserOwnership, middleware.isLoggedIn, userController.userEdit);

// UPDATE ROUTE
router.put('/:id', middleware.checkUserOwnership, middleware.isLoggedIn,  userController.userUpdate);
router.put('/:id/avatar', middleware.checkUserOwnership, middleware.isLoggedIn, multer.single('avatar'), userController.userUpdateAvatar);
router.put('/:id/password', middleware.checkUserOwnership, middleware.isLoggedIn, userController.userUpdatePassword);
router.put('/:id/follow', middleware.isLoggedIn, userController.userUpdateFollow);
router.put('/:id/unfollow', middleware.isLoggedIn, userController.userUpdateUnfollow);

module.exports = router;