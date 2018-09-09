const express     = require('express');
const router      = express.Router();
const middleware  = require('../middleware');

const userController = require('../controllers/userController');

// SHOW ROUTE
router.get('/:id', middleware.isLoggedIn, userController.userShow);

// UPDATE ROUTE
router.put('/:id', middleware.isLoggedIn, userController.userUpdate);

module.exports = router;