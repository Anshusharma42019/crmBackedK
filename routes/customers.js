const router = require('express').Router();
const { getCustomers, createCustomer, updateCustomer, deleteCustomer, getCustomer } = require('../controllers/customerController');
const { protect, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.use(protect);
router.get('/', getCustomers);
router.get('/:id', getCustomer);
router.post('/', upload.array('images', 5), createCustomer);
router.put('/:id', updateCustomer);
router.delete('/:id', authorize('admin'), deleteCustomer);

module.exports = router;
