const express = require('express');
const controller = require('../controllers/emailnotification.controller');
const router = express.Router();
const { admin, kong } = require('../../api/middlewares/auth');

router
  .route('/sendEmail')
  /**
   * @api {get} api/notify/sendEmail
   * @apiDescription Sends email to the recipients
   * @apiVersion 1.0.0
   * @apiName Send email
   * @apiGroup Notifications
   *
   * @apiSuccess {Object} Status and message
   */
  .post(kong(), admin(), controller.sendEmail);

router
  .route('/sendEmailUncreatedTransfers')
  /**
   * @api {get} api/notify/sendEmailUncreatedTransfers
   * @apiDescription Sends email to the recipients
   * @apiVersion 1.0.0
   * @apiName Send email
   * @apiGroup Notifications
   *
   * @apiSuccess {Object} Status and message
   */
  .post(kong(), admin(), controller.sendEmailUncreatedTransfers);

module.exports = router;
