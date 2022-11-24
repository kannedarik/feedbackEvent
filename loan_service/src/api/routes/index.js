const express = require('express');

const routesV1 = require('./v1');
const routesV2 = require('./v2');
const routesV3 = require('./v3');
const routesV4 = require('./v4');
const routesV5 = require('./v5');


const router = express.Router();

/**
 * GET /status
 */
router.get('/api/status', (req, res) => res.send('OK'));
router.get('/app/health', (req, res) => res.send({ status: 'OK' }));
router.get('/app/deephealth', (req, res) => res.send({ status: 'OK' })); // format will be provided by devops later which will contain details of healthy and non-healthy resources.

/**
 * API Routes
 */
router.use(routesV1);
router.use(routesV2);
router.use(routesV3);
router.use(routesV4);
router.use(routesV5);

module.exports = router;
