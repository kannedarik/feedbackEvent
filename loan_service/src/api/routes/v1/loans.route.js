const express = require('express');
const { celebrate: validate } = require('celebrate');
const { authorize } = require('../../middlewares/auth');
const controller = require('../../controllers/loan.controller');
const { supportlist, inProgress } = require('../../validations/loan.validation');

const router = express.Router();

router
  .route('/')
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
  .get(authorize(['customer']), controller.customerlist);

router
  .route('/support')
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
  .get(validate(supportlist, { allowUnknown: true }), authorize(['support']), controller.supportlist);

router
  .route('/quick-links')
  /**
   * @api {get} api/v1/loans/quick-links Get quick links
   * @apiDescription Get list of items to display on the home screen based on the repayment type.
   * Sends the image, name to display, and the params necessary to filter the /loans API also.
   * @apiVersion 1.0.0
   * @apiName Quick Links
   * @apiGroup Customer
   * @apiPermission customer
   *
   * @apiHeader {String} Authorization  User's access token
   *
   * @apiSuccess {Array}
   *
   * @apiError (Unauthorized 401)  Unauthorized  Only authenticated users can access the data
   * @apiError (Forbidden 403)     Forbidden     Only customer can access the data
   */
  .get(authorize(['customer']), controller.quickLinks);

router
  .route('/inprogress')
  /**
   * @api {get} api/v1/loans/inprogress Get in porgress loans list
   * @apiDescription Get list of in progress loans to display in loan details.
   * @apiVersion 1.0.0
   * @apiName In Progress
   * @apiGroup Customer
   * @apiPermission customer
   *
   * @apiHeader {String} Authorization  User's access token
   *
   * @apiSuccess {Array}
   *
   * @apiError (Unauthorized 401)  Unauthorized  Only authenticated users can access the data
   * @apiError (Forbidden 403)     Forbidden     Only customer can access the data
   */
  .get(validate(inProgress), authorize(['customer']), controller.inProgressLoans);

module.exports = router;
