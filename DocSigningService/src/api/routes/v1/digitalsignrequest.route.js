const express = require('express');
const { celebrate: validate } = require('celebrate');
const { authorizeKey } = require('../../middlewares/auth');
const controller = require('../../controllers/digitalsignrequest.controller');
const {
  create,
  otp,
  verify,
} = require('../../validations/v1/digitalsignrequest.validation');

const router = express.Router();

router
  .route('/')
  /**
   * @api {post} api/v1/requests/digital Create DigitalSign Request
   * @apiDescription Create DigitalSign Request
   * @apiVersion 1.0.0
   * @apiName Create
   * @apiGroup DigitalSignRequest
   * @apiPermission client
   *
   * @apiSuccess {Object} DigitalSignRequest
   *
   * @apiError (Unauthorized 401)  Unauthorized  Only authenticated users can access the data
   * @apiError (Forbidden 403)     Forbidden     Only client can access the data
   *
   */
  .post(validate(create), authorizeKey(), controller.create);

router
  .route('/:id/otp')
  /**
   * @api {put} api/v1/requests/digital/:id/otp DigitalSign Request OTP
   * @apiDescription DigitalSign Request OTP
   * @apiVersion 1.0.0
   * @apiName OTP
   * @apiGroup DigitalSignRequest
   * @apiPermission client
   *
   * @apiSuccess {Object} DigitalSignRequest
   *
   * @apiError (Unauthorized 401)  Unauthorized  Only authenticated users can access the data
   * @apiError (Forbidden 403)     Forbidden     Only client can access the data
   *
   */
  .put(validate(otp), authorizeKey(), controller.otp);

router
  .route('/:id/verify')
  /**
   * @api {put} api/v1/requests/digital/:id/verify Verify DigitalSign Request
   * @apiDescription Verify DigitalSign Request
   * @apiVersion 1.0.0
   * @apiName Verify
   * @apiGroup DigitalSignRequest
   * @apiPermission client
   *
   * @apiSuccess {Object} DigitalSignRequest
   *
   * @apiError (Unauthorized 401)  Unauthorized  Only authenticated users can access the data
   * @apiError (Forbidden 403)     Forbidden     Only client can access the data
   *
   */
  .put(validate(verify), authorizeKey(), controller.verify);

module.exports = router;
