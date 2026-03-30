const router = require('express').Router();
const { getFollowups, createFollowup, updateFollowup, deleteFollowup } = require('../controllers/followupController');
const { protect } = require('../middleware/auth');

router.use(protect);
router.get('/', getFollowups);
router.post('/', createFollowup);
router.put('/:id', updateFollowup);
router.delete('/:id', deleteFollowup);

module.exports = router;
