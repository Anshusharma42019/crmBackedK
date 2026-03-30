const router = require('express').Router();
const { getStaff, createStaff, updateStaff, deleteStaff } = require('../controllers/userController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);
router.get('/', getStaff);
router.post('/', authorize('admin'), createStaff);
router.put('/:id', authorize('admin'), updateStaff);
router.delete('/:id', authorize('admin'), deleteStaff);

module.exports = router;
