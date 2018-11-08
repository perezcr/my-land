const express     = require('express');
const router      = express.Router({mergeParams: true});

const middleware        = require('../middleware');
const commentController = require('../controllers/commentController');

// CREATE ROUTE
router.post('/', middleware.isLoggedIn, commentController.commentCreate);

// UPDATE ROUTE
router.put('/:comment_id', middleware.checkCommentOwnership, commentController.commentUpdate);

// DESTROY ROUTE
router.delete('/:comment_id', middleware.checkCommentOwnership, commentController.commentDestroy);

module.exports = router;