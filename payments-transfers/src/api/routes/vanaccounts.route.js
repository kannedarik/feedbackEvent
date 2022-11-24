const express = require('express');
const controller = require('../controllers/vanaccounts.controller');
const router = express.Router();
const { admin, kong } = require('../../api/middlewares/auth');

router
  .route('/')
  /**
   * @api {get} api/vanaccounts
   * @apiDescription Get all van accounts
   * @apiVersion 1.0.0
   * @apiName Get all van accounts
   * @apiGroup Payments Transfers
   *
   * @apiSuccess {Object} Status and message
   */
  .get(kong(), admin(), controller.getAllAccounts);

router
  .route('/:accountno')
  /**
   * @api {get} api/vanaccounts/lenderid
   * @apiDescription Get van accountid for van accountno
   * @apiVersion 1.0.0
   * @apiName Get van accountid
   * @apiGroup Payments Transfers
   *
   * @apiSuccess {Object} Status and message
   */
  .get(kong(), admin(), controller.getVanAccountId);

router
  .route('/')
  /**
   * @api {post} api/vanaccounts/vanaccount
   * @apiDescription Create van account with {accountno, accountid}
   * @apiVersion 1.0.0
   * @apiName Create van account
   * @apiGroup Payments Transfers
   *
   * @apiSuccess {Object} Status and message
   */
  .post(kong(), admin(), controller.create);

router
  .route('/:accountno')
  /**
   * @api {delete} api/vanaccounts
   * @apiDescription Deletes van account
   * @apiVersion 1.0.0
   * @apiName Delete van account
   * @apiGroup Payments Transfers
   *
   * @apiSuccess {Object} Status and message
   */
  .delete(kong(), admin(), controller.delete);

router
  .route('/')
  /**
   * @api {delete} api/vanaccounts
   * @apiDescription Deletes van account
   * @apiVersion 1.0.0
   * @apiName Delete van account
   * @apiGroup Payments Transfers
   *
   * @apiSuccess {Object} Status and message
   */
  .put(kong(), admin(), controller.update);


module.exports = router;
