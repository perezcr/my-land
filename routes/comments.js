const express     = require('express');
const router      = express.Router({mergeParams: true});

const middleware        = require('../middleware');
const commentController = require('../controllers/commentController');

// NEW ROUTE - comments
router.get('/new', middleware.isLoggedIn, commentController.commentNew);

// CREATE ROUTE - comments
router.post('/', middleware.isLoggedIn, commentController.commentCreate);

// EDIT ROUTE
router.get('/:comment_id/edit', middleware.checkCommentOwnership, commentController.commentEdit);

// UPDATE ROUTE
router.put('/:comment_id', middleware.checkCommentOwnership, commentController.commentUpdate);

// DESTROY ROUTE
router.delete('/:comment_id', middleware.checkCommentOwnership, commentController.commentDestroy);

module.exports = router;