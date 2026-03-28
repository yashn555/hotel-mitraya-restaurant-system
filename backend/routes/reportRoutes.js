const express = require('express');
const router = express.Router();
const {
    getDailyReport,
    getMonthlyReport,
    getProfitReport
} = require('../controllers/reportController');

router.get('/daily/:date', getDailyReport);
router.get('/monthly/:year/:month', getMonthlyReport);
router.get('/profit/:startDate/:endDate', getProfitReport);

module.exports = router;