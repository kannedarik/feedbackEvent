const express = require('express');
const customerRoutes = require('./customer.route');
const orderRoutes = require('./order.route');
const orderTypeRoutes = require('./ordertype.route');
const renewalOrderRoutes = require('./renewalorder.route');
const zeebeRoutes = require('./zeebe.route');
const partreleaseRoutes = require('./partrelease.route');
const supportRoutes = require('./support.route');
const featureFlag = require('./featureFlag.route');
const differentialScheme = require('./differentialscheme.route');
const client = require('./client.route');

const router = express.Router();

/**
 * API Routes
 */
router.use('/api/v1/customer', customerRoutes);
router.use('/api/v1/orders/renewals', renewalOrderRoutes);
router.use('/api/v1/orders', orderRoutes);
router.use('/api/v1/types', orderTypeRoutes);
router.use('/api/v1/zeebe', zeebeRoutes);
router.use('/api/v1/partrelease', partreleaseRoutes);
router.use('/api/v1/support', supportRoutes);
router.use('/api/v1/featureflag', featureFlag);
router.use('/api/v1/differentialscheme', differentialScheme);
router.use('/api/v1/clients', client);

module.exports = router;
