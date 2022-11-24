const express = require('express');
const router = express.Router();

const lenderDetailRoutes = require('./lenderaccountdetails.route');
const paymentsRoutes = require('./payments.route');
const vanaccountRoutes = require('./vanaccounts.route');
const emailNotificationRoutes = require('./emailnotification.route');
/**
* GET /api/status
*/
router.get('/api/status', (req, res, next) => {
  return res.status(200).send({
    data: "OK"
  })
  next();
});

/**
* API Routes
*/
router.use('/api/lenders', lenderDetailRoutes);

router.use('/api/transfers', paymentsRoutes);

router.use('/api/vanaccounts', vanaccountRoutes);

router.use('/api/notify', emailNotificationRoutes);


module.exports = router;
