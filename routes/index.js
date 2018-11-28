const express = require('express');
const router = express.Router();
const authController = require('../controllers//authController');
const commentController = require('../controllers/commentController');
const landscapeController = require('../controllers/landscapeController');
const notificationController = require('../controllers/notificationController');
const reviewController = require('../controllers/reviewController');
const userController = require('../controllers/userController');
const { catchErrors } = require('../handlers/errorHandlers');
const multer = require('../handlers/multer');

// AUTH ROUTES
router.get("/", userController.landing);

router.get('/signup', userController.registerForm);
router.post('/signup', catchErrors(userController.register), authController.login);
router.get('/login', userController.loginForm);
router.post('/login', authController.login);
router.get('/logout', authController.logout);

router.get('/auth/facebook', authController.facebook);
router.get('/auth/facebook/callback', authController.facebookCb);
router.get('/auth/google', authController.google);
router.get('/auth/google/callback', authController.googleCb);

// USER ROUTES
router.post('/users/forgot', catchErrors(authController.forgot));
router.get('/users/reset/:token', catchErrors(authController.reset));
router.post('/users/reset/:token', authController.confirmPassword, catchErrors(authController.update));

// SHOW
router.get('/users/:id', authController.isLoggedIn, catchErrors(userController.profile));
// EDIT
router.get('/users/:id/edit', authController.isLoggedIn, catchErrors(userController.checkUserOwnership), catchErrors(userController.editForm));
// UPDATE
router.put('/users/:id', authController.isLoggedIn, catchErrors(userController.checkUserOwnership), catchErrors(userController.updateUser));
router.put('/users/:id/avatar', authController.isLoggedIn, catchErrors(userController.checkUserOwnership), multer.single('avatar'), catchErrors(userController.updateAvatar));
router.put('/users/:id/password', authController.isLoggedIn, catchErrors(userController.checkUserOwnership), authController.confirmPassword, catchErrors(userController.updatePassword));
router.put('/users/:id/follow', authController.isLoggedIn, catchErrors(userController.follow));
router.put('/users/:id/unfollow', authController.isLoggedIn, catchErrors(userController.unfollow));

// LANDSCAPE ROUTES
// INDEX
router.get('/landscapes', catchErrors(landscapeController.getLandscapes));
// NEW
router.get('/landscapes/new', authController.isLoggedIn, landscapeController.addLandscapeForm);
// CREATE
router.post('/landscapes', authController.isLoggedIn, multer.single('image'), catchErrors(landscapeController.createLandscape));
// SHOW
router.get('/landscapes/:id', catchErrors(landscapeController.showLandscape));
// EDIT
router.get('/landscapes/:id/edit', authController.isLoggedIn, catchErrors(landscapeController.checkLandscapeOwnership), catchErrors(landscapeController.editLandscapeForm));
// UPDATE
router.put('/landscapes/:id', authController.isLoggedIn, catchErrors(landscapeController.checkLandscapeOwnership), multer.single('image'), catchErrors(landscapeController.updateLandscape));
// DESTROY
router.delete('/landscapes/:id', authController.isLoggedIn, catchErrors(landscapeController.checkLandscapeOwnership), catchErrors(landscapeController.deleteLandscape));

// COMMENT ROUTES
// CREATE
router.post('/landscapes/:id/comments', authController.isLoggedIn, catchErrors(commentController.createComment));
// UPDATE
router.put('/landscapes/:id/comments/:comment_id', authController.isLoggedIn, catchErrors(commentController.checkCommentOwnership), catchErrors(commentController.updateComment));
// DESTROY
router.delete('/landscapes/:id/comments/:comment_id', authController.isLoggedIn, catchErrors(commentController.checkCommentOwnership), catchErrors(commentController.deleteComment));

// NOTIFICATION ROUTES
// INDEX
router.get('/users/:id/notifications', authController.isLoggedIn, catchErrors(notificationController.getNotifications));
// SHOW
router.get('/users/:id/notifications/:notification_id', authController.isLoggedIn, catchErrors(notificationController.showNotification));

// REVIEW ROUTES
// INDEX
router.get('/landscapes/:id/reviews', catchErrors(reviewController.getReviews));
// CREATE
router.post('/landscapes/:id/reviews', authController.isLoggedIn, catchErrors(reviewController.checkReviewExistence), catchErrors(reviewController.createReview));
// UPDATE
router.put('/landscapes/:id/reviews/:review_id', authController.isLoggedIn, catchErrors(reviewController.checkReviewOwnership), catchErrors(reviewController.updateReview));
// DESTROY
router.delete('/landscapes/:id/reviews/:review_id', authController.isLoggedIn, catchErrors(reviewController.checkReviewOwnership), catchErrors(reviewController.deleteReview));

module.exports = router;