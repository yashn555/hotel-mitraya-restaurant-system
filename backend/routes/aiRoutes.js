const express = require('express');
const router = express.Router();
const { getProfitInsights, testAIConnection } = require('../controllers/aiController');

// Test AI connection
router.get('/test', testAIConnection);

// Get profit insights
router.get('/profit-insights', getProfitInsights);

module.exports = router;