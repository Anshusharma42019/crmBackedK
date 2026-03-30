const router = require('express').Router();
const { getDeliveries, updateDeliveryStatus, getDeliveryStats } = require('../controllers/deliveryController');
const { protect } = require('../middleware/auth');

router.use(protect);
router.get('/', getDeliveries);
router.get('/stats', getDeliveryStats);
router.put('/:id/status', updateDeliveryStatus);

module.exports = router;
