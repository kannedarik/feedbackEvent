const express = require('express');
const { celebrate: validate } = require('celebrate');
const { authorize } = require('../../middlewares/auth');
const controller = require('../../controllers/customer.controller');
const {
  lenderphones,
} = require('../../validations/customer.validation');

const router = express.Router();

router
  .route('/lenderphones')
  /**
   * @api {get} api/v1/customer/lenderphones
   * @apiDescription Get all lender phones
   * @apiVersion 1.0.0
   * @apiName Complete
   * @apiGroup Customer
   *
   *
   * @apiSuccess {Object} LenderPhones
   */
  .get(validate(lenderphones, { allowUnknown: true }), authorize(['customer']), controller.lenderphones);

module.exports = router;
