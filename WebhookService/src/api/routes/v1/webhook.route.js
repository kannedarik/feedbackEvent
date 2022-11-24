const express = require('express');
const { celebrate: validate } = require('celebrate');
const controller = require('../../controllers/webhook.controller');
const {
  razorpay,
} = require('../../validations/v1/webhook.validation');

const router = express.Router();

router
  .route('/razorpay')
  /**
   * @api {post} api/v1/razorpay Razorpay Webhook
   * @apiDescription Razorpay Webhook
   * @apiVersion 1.0.0
   * @apiName Razorpay
   * @apiGroup Webhook
   *
   * @apiHeader {String} Authorization  Razorpay Token
   *
   * @apiSuccess {Object} Status and Message
   *
   * @apiError (Unauthorized 401)  Unauthorized  Only authenticated data can access the data
   * @apiError (Forbidden 403)     Forbidden     Only razorpay can access the data
   */
  .post(validate(razorpay), controller.razorpay);

router
  .route('/leegality')
  /**
   * @api {post} api/v1/leegality Leegality webhook
   * @apiDescription Leegality webhook
   * @apiVersion 1.0.0
   * @apiName Leegality
   * @apiGroup Webhook
   * @apiPermission public
   *
   * @apiSuccess {Object} Status and Message
   *
   */
  .post(controller.leegality);

router
  .route('/kaleyra')
  /**
   * @api {get} api/v1/kaleyra Kaleyra Webhook
   * @apiDescription Kaleyra Webhook
   * @apiVersion 1.0.0
   * @apiName Kaleyra
   * @apiGroup Webhook
   * @apiPermission public
   *
   * @apiSuccess {Object} Webhook
   *
   */
  .get(controller.kaleyra);

module.exports = router;

router
  .route('/twilio')
  /**
   * @api {post} api/v1/twilio Twilio Webhook
   * @apiDescription Twilio Webhook
   * @apiVersion 1.0.0
   * @apiName Twilio
   * @apiGroup Webhook
   * @apiPermission public
   *
   * @apiSuccess {Object} Webhook
   *
   */
  .post(controller.twilio);

router
  .route('/twofactor')
  /**
   * @api {post} api/v1/twofactor 2factor Webhook
   * @apiDescription 2factor Webhook
   * @apiVersion 1.0.0
   * @apiName 2factor
   * @apiGroup Webhook
   * @apiPermission public
   *
   * @apiSuccess {Object} Webhook
   *
   */
  .post(controller.twofactor);

router
  .route('/payment')
  /**
   * @api {post} api/v1/payment Payment Webhook
   * @apiDescription Payment Webhook
   * @apiVersion 1.0.0
   * @apiName Payment
   * @apiGroup Webhook
   * @apiPermission public
   *
   * @apiSuccess {Object} Webhook
   *
   */
  .post(controller.payment);

router
  .route('/oms/docsign')
  /**
   * @api {post} api/v1/oms/docsign OMS DocSign Webhook
   * @apiDescription OMS DocSign Webhook
   * @apiVersion 1.0.0
   * @apiName OMSDocSign
   * @apiGroup Webhook
   * @apiPermission public
   *
   * @apiSuccess {Object} Webhook
   *
   */
  .post(controller.omsSigning);

module.exports = router;
