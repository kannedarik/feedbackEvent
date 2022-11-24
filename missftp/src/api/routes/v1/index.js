const express = require('express');

const misfileRoutes = require('./misfile.route');

const router = express.Router();

/**
* API Routes
*/
router.use('/api/v1/getmisfile', misfileRoutes);

module.exports = router;
