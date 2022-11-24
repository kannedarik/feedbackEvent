const express = require('express');
const { celebrate: validate } = require('celebrate');
const { authorize } = require('../../middlewares/auth');
const controller = require('../../controllers/v3/renewalorder.controller');
const { create } = require('../../validations/v1/renewalorder.validation');

const router = express.Router();

router
  .route('/')
  /**
   * @api {post} api/v3/orders/renewals Create Renewal Order
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

module.exports = router;
