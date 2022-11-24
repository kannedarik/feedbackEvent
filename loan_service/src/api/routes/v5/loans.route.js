const express = require('express');
// eslint-disable-next-line no-unused-vars
const { celebrate: validate } = require('celebrate');
const { authorize } = require('../../middlewares/auth');
const controller = require('../../controllers/v5/loan.controller');
const { supportcustomerlist, toggleRelease } = require('../../validations/loan.validation');

const router = express.Router();

router
  .route('/')
  /**
   * @api {get} api/v5/loans Get Agent List
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
  .route('/customerLoans')
  .get(validate(supportcustomerlist, { allowUnknown: true }), authorize(['support']), controller.customerloans);

router
  .route('/:loanId')
  .post(validate(toggleRelease, { allowUnknown: true }), authorize(['techsupport']), controller.supportToggleRelease);

router
  .route('/list')
  /**
   * @api {get} api/v5/loans/list Get all active and closed loans list
   * @apiDescription Get loan list to show in payment history loan filter
   * @apiVersion 1.0.0
   * @apiName LoanList
   * @apiGroup Loan
   * @apiPermission customer
   *
   * @apiHeader {String} Authorization  User's access token
   *
   * @apiSuccess {Array} loans List of loans.
   *
   * @apiError (Forbidden 403)     Forbidden     Only customer can access the data
   */
  .get(authorize(['customer']), controller.listAllCustomerLoans);

module.exports = router;
