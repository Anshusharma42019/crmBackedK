const router = require('express').Router();
const { getBookings, createBooking, updateBooking, deleteBooking } = require('../controllers/bookingController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);
router.get('/', getBookings);
router.post('/', createBooking);
router.put('/:id', updateBooking);
router.delete('/:id', authorize('admin'), deleteBooking);

module.exports = router;
