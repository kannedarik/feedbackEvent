const express = require('express');
const { celebrate: validate } = require('celebrate');
const { authorize } = require('../../middlewares/auth');
const controller = require('../../controllers/v2/renewalorder.controller');
const {
  create,
  viewDocument,
} = require('../../validations/v1/renewalorder.validation');

const router = express.Router();

router
  .route('/')
  /**
   * @api {post} api/v2/orders/renewals Create Renewal Order
   * @apiDescription Create Renewal Order
   * @apiVersion 1.0.0
   * @apiName Create
   * @apiGroup RenewalOrder
   * @apiPermission customer
   *
   * @apiHeader {String} Authorization  User's access token
   *
   * @apiSuccess {Object} RenewalOrder
   *
   * @apiError (Unauthorized 401)  Unauthorized  Only authenticated users can access the data
   * @apiError (Forbidden 403)     Forbidden     Only customer can access the data
   */
  .post(validate(create), authorize(['customer']), controller.create);

router
  .route('/:orderId/document')
  /**
   * @api {get} api/v2/orders/renewals/:orderId/document View Unsigned Document
   * @apiDescription View Unsigned Document
   * @apiVersion 2.0.0
   * @apiName ViewUnsignedDocumentV2
   * @apiGroup RenewalOrder
   * @apiPermission customer
   *
   * @apiHeader {String} Authorization  User's access token
   *
   * @apiSuccess {Object} Unsigned Document
   *
   * @apiError (Unauthorized 401)  Unauthorized  Only authenticated users can access the data
   * @apiError (Forbidden 403)     Forbidden     Only customer can access the data
   */
  .get(validate(viewDocument), authorize(['customer']), controller.viewUnSignedDoc);

module.exports = router;
