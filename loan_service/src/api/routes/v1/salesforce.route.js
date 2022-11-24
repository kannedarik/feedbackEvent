const express = require('express');
const { celebrate: validate } = require('celebrate');
const { authorize } = require('../../middlewares/auth');
const controller = require('../../controllers/v1/salesforce.controller');
const { loans, payments } = require('../../validations/salesforce.validation');

const router = express.Router();

router
  .route('/customer/loans/:searchId')
  /**
   * @api {post} api/v1/salesforce/customer/loans Get customer loans List
   * @apiDescription Get customer loans List
   * @apiVersion 1.0.0
   * @apiName customerLoans
   * @apiGroup salesforceapi
   * @apiPermission support
   *
   * @apiHeader {String} Authorization  support access token
   *
   * @apiSuccess {Array} agents List of agents.
   *
   * @apiError (Unauthorized 401)  Unauthorized  Only support agents can access the data
   * @apiError (Forbidden 403)     Forbidden     Only support can access the data
   */
  .get(validate(loans), authorize(['support']), controller.customerLoans);

router
  .route('/payments')
  /**
   * @api {post} api/v1/salesforce/payments Get loans payment transaction List
   * @apiDescription Get loans payment transaction List
   * @apiVersion 1.0.0
   * @apiName customerLoans
   * @apiGroup salesforceapi
   * @apiPermission support
   *
   * @apiHeader {String} Authorization  support access token
   *
   * @apiSuccess {Array} agents List of agents.
   *
   * @apiError (Unauthorized 401)  Unauthorized  Only support agents can access the data
   * @apiError (Forbidden 403)     Forbidden     Only support can access the data
   */
  .get(validate(payments), authorize(['support']), controller.paymentTransactions);


module.exports = router;
