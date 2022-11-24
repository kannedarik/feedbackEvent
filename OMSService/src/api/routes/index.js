const express = require('express');

const routesV1 = require('./v1');
const routesV2 = require('./v2');
const routesV3 = require('./v3');
const healthRoutes = require('./health.route');

const router = express.Router();

/**
 * GET /status
 */
router.get('/api/status', (req, res) => res.send('OK'));

/**
 * API Routes
 */
router.use(routesV1);
router.use(routesV2);
router.use(routesV3);
router.use('/app', healthRoutes);

module.exports = router;
