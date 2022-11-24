const express = require('express');
const clientRoutes = require('./client.route');
const digitalSignProviderRoutes = require('./digitalsignprovider.route');
const eSignProviderRoutes = require('./esignprovider.route');
const physicalSignProviderRoutes = require('./physicalsignprovider.route');
const digitalSignRequestRoutes = require('./digitalsignrequest.route');
const eSignRequestRoutes = require('./esignrequest.route');
const signingRequestRoutes = require('./signingrequest.route');
const signingStatusRoutes = require('./signingstatus.route');
const signingTypeRoutes = require('./signingtype.route');

const router = express.Router();

/**
 * API Routes
 */
router.use('/api/v1/clients', clientRoutes);
router.use('/api/v1/providers/digital', digitalSignProviderRoutes);
router.use('/api/v1/providers/esign', eSignProviderRoutes);
router.use('/api/v1/providers/physical', physicalSignProviderRoutes);
router.use('/api/v1/requests/digital', digitalSignRequestRoutes);
router.use('/api/v1/requests/esign', eSignRequestRoutes);
router.use('/api/v1/requests', signingRequestRoutes);
router.use('/api/v1/statuses', signingStatusRoutes);
router.use('/api/v1/types', signingTypeRoutes);

module.exports = router;
