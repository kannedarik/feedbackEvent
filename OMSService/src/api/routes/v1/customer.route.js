const express = require('express');
const { celebrate: validate } = require('celebrate');
const { authorize } = require('../../middlewares/auth');
const controller = require('../../controllers/customer.controller');
const validation = require('../../validations/v1/customer.validation');

const router = express.Router();

router
  .route('/accounts')
  /**
   * @api {get} api/v1/customer/accounts List customer bank accounts
   * @apiDescription List customer bank accounts
   * @apiVersion 1.0.0
   * @apiName CustomerBankAccounts
   * @apiGroup Customer
   * @apiPermission customer
   *
   * @apiHeader {String} Authorization  User's access token
   *
   * @apiSuccess {Array} Bank Accounts
   *
   * @apiError (Unauthorized 401)  Unauthorized  Only authenticated users can access the data
   * @apiError (Forbidden 403)     Forbidden     Only customer can access the data
   */
  .get(authorize(['customer']), controller.listBankAccounts);

router
  .route('/accounts/init')
  /**
   * @api {get} api/v1/customer/accounts Create a customer bank account and initiate penny testing
   * @apiDescription Create a customer bank account and initiate penny testing
   * @apiVersion 1.0.0
   * @apiName CreateCustomerBankAccount
   * @apiGroup Customer
   * @apiPermission customer
   *
   * @apiHeader {String} Authorization  User's access token
   *
   * @apiSuccess {Array} Bank Account
   *
   * @apiError (Unauthorized 401)  Unauthorized  Only authenticated users can access the data
   * @apiError (Forbidden 403)     Forbidden     Only customer can access the data
   */
  .post(validate(validation.initBankAccount), authorize(['customer']), controller.initiatePennyTesting);

router
  .route('/accounts/otp/:transactionId/resend')
  /**
   * @api {get} api/v1/customer/accounts Resend OTP to customer
   * @apiDescription Resend verfication OTP to the customer
   * @apiVersion 1.0.0
   * @apiName ResendVerificationOTP
   * @apiGroup Customer
   * @apiPermission customer
   *
   * @apiHeader {String} Authorization  User's access token
   *
   * @apiError (Unauthorized 401)  Unauthorized  Only authenticated users can access the data
   * @apiError (Forbidden 403)     Forbidden     Only customer can access the data
   */
  .get(validate(validation.resend), authorize(['customer']), controller.resendOTP);

router
  .route('/accounts/otp/:transactionId/status')
  /**
   * @api {get} api/v1/customer/accounts Verify OTP from customer
   * @apiDescription Verify OTP from customer
   * @apiVersion 1.0.0
   * @apiName VerifyOTP
   * @apiGroup Customer
   * @apiPermission customer
   *
   * @apiHeader {String} Authorization  User's access token
   *
   * @apiError (Unauthorized 401)  Unauthorized  Only authenticated users can access the data
   * @apiError (Forbidden 403)     Forbidden     Only customer can access the data
   */
  .get(authorize(['customer']), controller.transactionStatus);

router
  .route('/accounts/otp/:transactionId/verify')
  /**
   * @api {get} api/v1/customer/accounts Verify OTP from customer
   * @apiDescription Verify OTP from customer
   * @apiVersion 1.0.0
   * @apiName VerifyOTP
   * @apiGroup Customer
   * @apiPermission customer
   *
   * @apiHeader {String} Authorization  User's access token
   *
   * @apiError (Unauthorized 401)  Unauthorized  Only authenticated users can access the data
   * @apiError (Forbidden 403)     Forbidden     Only customer can access the data
   */
  .post(authorize(['customer']), controller.verifyOTP);

module.exports = router;
