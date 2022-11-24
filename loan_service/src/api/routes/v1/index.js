const express = require('express');
const loanRoutes = require('./loans.route');
const cacheRoutes = require('./cache.route');
const reminderRoutes = require('./reminder.route');
const lmsRoute = require('./lms.route');
const salesforceRoutes = require('./salesforce.route');

const router = express.Router();

/**
 * API Routes
 */
router.use('/api/v1/loans', loanRoutes);
router.use('/api/v1/cache', cacheRoutes);
router.use('/api/v1/reminder', reminderRoutes);
router.use('/api/v1/lms', lmsRoute);
router.use('/api/v1/salesforce', salesforceRoutes);

module.exports = router;
