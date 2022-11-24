const express = require('express');
const customerRoutes = require('./customer.routes');

const router = express.Router();

/**
 * API Routes
 */
router.use('/api/v1/customer', customerRoutes);

module.exports = router;
