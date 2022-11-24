const express = require('express');
// eslint-disable-next-line no-unused-vars
const { celebrate: validate } = require('celebrate');
const { authorize } = require('../../middlewares/auth');
const controller = require('../../controllers/v3/loan.controller');
const { supportlist } = require('../../validations/loan.validation');

const router = express.Router();

router
  .route('/')
  /**
   * @api {get} api/v3/loans Get Agent List
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
   * @api {get} api/v3/loans/support Get Loan List for support
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

module.exports = router;
