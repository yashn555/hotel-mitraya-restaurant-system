const express = require('express');
const router = express.Router();
const {
    markAttendance,
    getAttendanceByDate,
    getMonthlyAttendance,
    getStaffMonthlySummary
} = require('../controllers/attendanceController');

router.post('/', markAttendance);
router.get('/date/:date', getAttendanceByDate);
router.get('/monthly/:year/:month', getMonthlyAttendance);
router.get('/summary/:staffId/:year/:month', getStaffMonthlySummary);

module.exports = router;