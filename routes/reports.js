const router = require('express').Router();
const { getDashboardStats, getReports } = require('../controllers/reportController');
const { protect } = require('../middleware/auth');

router.use(protect);
router.get('/dashboard', getDashboardStats);
router.get('/', getReports);

module.exports = router;
