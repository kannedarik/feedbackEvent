const express = require('express');
const { celebrate: validate } = require('celebrate');
const { authorize } = require('../../middlewares/auth');
const { publishSigningStatus, getBankAccountDetails } = require('../../controllers/support.controller');
const { signingstatus, bankaccount } = require('../../validations/v1/support.validation');

const router = express.Router();

router
  .route('/:orderId/signingstatus')
/**
     * @api {post} api/v1/support/:orderId/status for publishing the signing status
     * @apiDescription for publishing the signing status
     * @apiVersion 1.0.0
     * @apiName PublishSigningStatus
     * @apiGroup Support
     * @apiPermission support
     *
     * @apiHeader {String} Authorization  User's access token
     *
     * @apiSuccess {String} success message
     *
     * @apiError (Unauthorized 401)  Unauthorized  Only authenticated users can access the data
     * @apiError (Forbidden 403)     Forbidden     Only support can access the data
     */
  .post(validate(signingstatus), authorize(['support']), publishSigningStatus);

router
  .route('/:orderId/bankdetails')
/**
     * @api {post} api/v1/support/:orderId/bankdetails for fetching the bank account details
     * @apiDescription for fetching the bank account detailsbased on orderId
     * @apiVersion 1.0.0
     * @apiName getBankAccountDetails
     * @apiGroup Support
     * @apiPermission support
     *
     * @apiHeader {String} Authorization  User's access token
     *
     * @apiSuccess {String} success message
     *
     * @apiError (Unauthorized 401)  Unauthorized  Only authenticated users can access the data
     * @apiError (Forbidden 403)     Forbidden     Only support can access the data
     */
  .get(validate(bankaccount), authorize(['support']), getBankAccountDetails);

module.exports = router;
