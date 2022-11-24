const express = require('express');
// eslint-disable-next-line no-unused-vars
const { celebrate: validate } = require('celebrate');
const { authorize } = require('../../middlewares/auth');
const controller = require('../../controllers/v4/loan.controller');
const { supportlist, supportcustomerlist, supportaggregateloansjewels } = require('../../validations/loan.validation');

const router = express.Router();

router
  .route('/')
  /**
   * @api {get} api/v4/loans Get Agent List
   * @apiDescription Get Agent List
   * @apiVersion 1.0.0
   * @apiName AgentList
   * @apiGroup Agent
   * @apiPermission opsadmin, citymanager
   *
   * @apiHeader {String} Authorization  User's access token
   *
   * @apiSuccess {Array} agents List of agents.
   *
   * @apiError (Unauthorized 401)  Unauthorized  Only authenticated users can access the data
   * @apiError (Forbidden 403)     Forbidden     Only opsadmins or citymanagers can access the data
   */
  .get(authorize(['customer']), controller.customerList);

router
  .route('/support')
  /**
   * @api {get} api/v4/loans/support Get Loan List for support
   * @apiDescription Get Agent List
   * @apiVersion 1.0.0
   * @apiName AgentList
   * @apiGroup Agent
   * @apiPermission opsadmin, citymanager
   *
   * @apiHeader {String} Authorization  User's access token
   *
   * @apiSuccess {Array} agents List of agents.
   *
   * @apiError (Unauthorized 401)  Unauthorized  Only authenticated users can access the data
   * @apiError (Forbidden 403)     Forbidden     Only opsadmins or citymanagers can access the data
   */
  .get(validate(supportlist, { allowUnknown: true }), authorize(['support']), controller.supportList);

router
  .route('/supportCustomerLoans')
  /**
   * @api {get} api/v1/loans Get Agent List
   * @apiDescription Get Agent List
   * @apiVersion 1.0.0
   * @apiName AgentList
   * @apiGroup Agent
   * @apiPermission opsadmin, citymanager
   *
   * @apiHeader {String} Authorization  User's access token
   *
   * @apiSuccess {Array} agents List of agents.
   *
   * @apiError (Unauthorized 401)  Unauthorized  Only authenticated users can access the data
   * @apiError (Forbidden 403)     Forbidden     Only opsadmins or citymanagers can access the data
   */
  .get(validate(supportcustomerlist, { allowUnknown: true }), authorize(['support']), controller.supportcustomerloans);

router
  .route('/support/aggregateloansjewels')
  /**
   * @api {get} api/v1/loans Get Agent List
   * @apiDescription Get Agent List
   * @apiVersion 1.0.0
   * @apiName AgentList
   * @apiGroup Agent
   * @apiPermission opsadmin, citymanager
   *
   * @apiHeader {String} Authorization  User's access token
   *
   * @apiSuccess {Array} agents List of agents.
   *
   * @apiError (Unauthorized 401)  Unauthorized  Only authenticated users can access the data
   * @apiError (Forbidden 403)     Forbidden     Only opsadmins or citymanagers can access the data
   */
  .get(validate(supportaggregateloansjewels, { allowUnknown: true }), authorize(['support']), controller.supportaggregateloansjewels);

router
  .route('/accounts')
  /**
   * @api {get} api/v4/loans/accounts update loans ipc values with account service
   * @apiDescription update ipc values
   * @apiVersion 1.0.0
   * @apiName accounts ipcvalues
   * @apiGroup Agent
   * @apiPermission customer
   *
   * @apiHeader {String} Authorization  User's access token
   *
   * @apiSuccess {Array} agents List of agents.
   *
   * @apiError (Unauthorized 401)  Unauthorized  Only authenticated users can access the data
   * @apiError (Forbidden 403)     Forbidden     Only opsadmins or citymanagers can access the data
   */
  .post(authorize(['customer', 'support']), controller.updatePaymentLoansWithAccountService);


module.exports = router;
