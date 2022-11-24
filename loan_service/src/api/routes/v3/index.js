const express = require('express');
const loanRoutes = require('./loans.route');

const router = express.Router();

/**
 * API Routes
 */
router.use('/api/v3/loans', loanRoutes);

module.exports = router;
