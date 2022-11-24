const express = require('express');
const webhookRoutes = require('./webhook.route');

const router = express.Router();

/**
 * API Routes
 */
router.use('/api/v1', webhookRoutes);

module.exports = router;
