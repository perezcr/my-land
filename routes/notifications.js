const express     = require('express');
const router      = express.Router({mergeParams: true});

const middleware              = require('../middleware');
const notificationController  = require('../controllers/notificationController');

// INDEX ROUTE
router.get('/', middleware.isLoggedIn, notificationController.notificationIndex);

// SHOW ROUTE
router.get('/:notification_id', middleware.isLoggedIn, notificationController.notificationShow);

module.exports = router;