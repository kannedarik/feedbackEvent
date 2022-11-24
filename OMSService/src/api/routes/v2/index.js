const express = require('express');
const renewalOrderRoutes = require('./renewalorder.route');

const router = express.Router();

/**
 * API Routes
 */
router.use('/api/v2/orders/renewals', renewalOrderRoutes);

module.exports = router;
