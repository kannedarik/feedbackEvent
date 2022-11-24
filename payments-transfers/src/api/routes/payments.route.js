const express = require('express');
const controller = require('../controllers/payments.controller');
const router = express.Router();
const { support, kong } = require('../../api/middlewares/auth');

router
  .route('/getUnsuccesfulTransfers')
  /**
   * @api {post} api/transfers/getUnsuccesfulTransfers
   * @apiDescription Get Failed Transfers with DEFAULT payment type
   * @apiVersion 1.0.0
   * @apiName Get
   * @apiGroup Transfers
   *
   * @apiSuccess {Object} Status and message
   */
  .post(kong(), support(), controller.unsuccessfulTransfers);

router
  .route('/getTempVanPayment')
  /**
   * @api {post} api/transfers/getTempVanPayment
   * @apiDescription Get Failed Transfers for temp van payment
   * @apiVersion 1.0.0
   * @apiName Get temp van payments
   * @apiGroup Transfers
   *
   * @apiSuccess {Object} Status and message
   */
  .post(kong(), support(), controller.tempVanPayments);

router
  .route('/getUnlinkedVanPayment')
  /**
   * @api {post} api/transfers/getUnlinkedVanPayment
   * @apiDescription Get Failed Transfers for unlinked van payments
   * @apiVersion 1.0.0
   * @apiName Get unlinked van payments
   * @apiGroup Transfers
   *
   * @apiSuccess {Object} Status and message
   */
  .post(kong(), support(), controller.unlinkedVanPayments);

router
  .route('/createMultiLenderTransfers')
  /**
   * @api {post} api/transfers/createMultiLenderTransfers
   * @apiDescription Create transfers for multi-lenders
   * @apiVersion 1.0.0
   * @apiName Create mulit lender transfers
   * @apiGroup Transfers
   *
   * @apiSuccess {Object} Status and message
   */
  .post(kong(), support(), controller.createMultiLenderTransfers);


router
  .route('/createTransfers')
  /**
   * @api {post} api/transfers/createTransfers
   * @apiDescription Create transfers
   * @apiVersion 1.0.0
   * @apiName Get
   * @apiGroup Transfers
   *
   * @apiSuccess {Object} Status and message
   */
  .post(kong(), support(), controller.createTransfers);

router
  .route('/retryTransfers')
  /**
   * @api {post} api/transfers/retryFailedTransfers
   * @apiDescription Retries failed transfers
   * @apiVersion 1.0.0
   * @apiName Retry failed transfers
   * @apiGroup Transfers
   *
   * @apiSuccess {Object} Status and message
   */
  .post(kong(), support(), controller.retryFailedTransfers);

router
  .route('/falselyTaggedTransfers')
  /**
   * @api {post} api/transfers/falselyTaggedTransfers
   * @apiDescription Fetches all the transfers which are wrongly show on UI
   * @apiVersion 1.0.0
   * @apiName Get falsely tagged transfers on UI
   * @apiGroup Transfers
   *
   * @apiSuccess {Object} Status and message
   */
  .post(kong(), support(), controller.falselyTaggedTransfers);

router
  .route('/paymentrequest')
  /**
   * @api {post} api/transfers/paymentrequest
   * @apiDescription Updates incorrect amounts in payment requests
   * @apiVersion 1.0.0
   * @apiName Update incorrect amounts in DB
   * @apiGroup Transfers
   *
   * @apiSuccess {Object} Status and message
   */
  .patch(kong(), support(), controller.updatePaymentAmount);

module.exports = router;
