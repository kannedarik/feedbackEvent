const express = require('express');
const controller = require('../controllers/lenderaccounts.controller');
const router = express.Router();
const { admin, kong } = require('../../api/middlewares/auth');

router
  .route('/')
  /**
   * @api {get} api/lenders
   * @apiDescription Get all lenders details
   * @apiVersion 1.0.0
   * @apiName Get all lenders
   * @apiGroup Payments Transfers
   *
   * @apiSuccess {Object} Status and message
   */
  .get(kong(), admin(), controller.getAllLenders);

router
  .route('/:lenderId')
  /**
   * @api {get} api/lenders/lenderid
   * @apiDescription Get a lender detail
   * @apiVersion 1.0.0
   * @apiName Get lender
   * @apiGroup Payments Transfers
   *
   * @apiSuccess {Object} Status and message
   */
  .get(kong(), admin(), controller.getLenderDetails);

router
  .route('/')
  /**
   * @api {post} api/lenders
   * @apiDescription Create a lender
   * @apiVersion 1.0.0
   * @apiName Create lender
   * @apiGroup Payments Transfers
   *
   * @apiSuccess {Object} Status and message
   */
  .post(kong(), admin(), controller.create);

router
  .route('/')
  /**
   * @api {delete} api/lenders
   * @apiDescription Deletes lender
   * @apiVersion 1.0.0
   * @apiName Delete lender
   * @apiGroup Payments Transfers
   *
   * @apiSuccess {Object} Status and message
   */
  .delete(kong(), admin(), controller.delete);


module.exports = router;
