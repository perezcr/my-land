const express             = require('express');
const router              = express.Router();

const middleware          = require('../middleware'); /** It's not necessary to write index */
const landscapeController = require('../controllers/landscapeController');

// INDEX ROUTE
router.get('/', landscapeController.landscapeIndex);

// NEW ROUTE
router.get('/new', middleware.isLoggedIn, landscapeController.landscapeNew);

// CREATE ROUTE
router.post('/', middleware.isLoggedIn, landscapeController.landscapeCreate);

// SHOW ROUTE
router.get('/:id', landscapeController.landscapeShow);

// EDIT ROUTE
router.get('/:id/edit', middleware.checkLandscapeOwnership, landscapeController.landscapeEdit);

// UPDATE ROUTE
router.put('/:id', middleware.checkLandscapeOwnership, landscapeController.landscapeUpdate);

// DESTROY ROUTE  
router.delete('/:id', middleware.checkLandscapeOwnership, landscapeController.landscapeDestroy);

module.exports = router;