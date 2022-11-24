const express = require('express');
const loanRoutes = require('./loans.route');

const router = express.Router();

/**
 * API Routes
 */
router.use('/api/v5/loans', loanRoutes);

module.exports = router;
