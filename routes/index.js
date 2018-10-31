const express     = require('express');
const router      = express.Router();

const indexController = require('../controllers/indexController');

// Landing
router.get("/", indexController.indexLanding);

router.get('/signup', indexController.indexSignUpGet);

router.post('/signup', indexController.indexSignUpPost);

router.get('/login', indexController.indexLoginGet);

router.post('/login', indexController.indexLoginPost);

router.post('/forgot', indexController.indexForgotPost);

router.get('/reset/:token', indexController.indexResetGet);

router.post('/reset/:token', indexController.indexResetPost);

// Facebook Routes
//
// Redirect the user to Facebook for authentication. When complete,
// Facebook will redirect the user back to the application at
//     /auth/facebook/callback
router.get('/auth/facebook', indexController.indexAuthFb);

router.get('/auth/facebook/callback', indexController.indexAuthCallbackFb);

// Google Routes
//
// Redirect the user to Google for authentication. When complete,
// Google will redirect the user back to the application at
//     /auth/google/callback
router.get('/auth/google', indexController.indexAuthGoogle);

router.get('/auth/google/callback', indexController.indexAuthCallbackGoogle);

router.get('/logout', indexController.indexLogout);

module.exports = router;