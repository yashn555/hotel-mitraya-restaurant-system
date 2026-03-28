const express = require('express');
const router = express.Router();
const { saveBill, getBills, viewBill } = require('../controllers/billController');

// Save bill
router.post('/save', saveBill);

// Get all bills
router.get('/list', getBills);

// View specific bill
router.get('/view/:date/:filename', viewBill);

module.exports = router;