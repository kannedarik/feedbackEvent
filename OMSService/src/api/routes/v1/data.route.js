const express = require('express');
const controller = require('../../controllers/data.controller');

const router = express.Router();

router
  .route('/')
  /**
   * @api {get} api/v1/data/ Get data for tenurextenstion
   * @apiDescription Get data for tenurextenstion
   * @apiVersion 1.0.0
   * @apiName Tenurextenstion
   * @apiGroup Tenurextenstion
   * @apiPermission public
   *
   * @apiHeader Empty
   *
   * @apiSuccess {Object} File
   *
   */
  .get(controller.data);

router
  .route('/bulkrenewal')
  /**
   * @api {get} api/v1/data/bulkrenewal Get data for Renewal
   * @apiDescription Get data for tenurextenstion
   * @apiVersion 1.0.0
   * @apiName Renewal
   * @apiGroup Renewal
   * @apiPermission public
   *
   * @apiHeader Empty
   *
   * @apiSuccess {Object} File
   *
   */
  .get(controller.bulkRenewalData);

module.exports = router;
