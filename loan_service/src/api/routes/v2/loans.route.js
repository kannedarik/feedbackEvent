const express = require('express');
// eslint-disable-next-line no-unused-vars
const { celebrate: validate } = require('celebrate');
const { authorize } = require('../../middlewares/auth');
const controller = require('../../controllers/loan.controller');

const router = express.Router();

router
  .route('/')
  /**
   * @api {get} api/v2/loans Get Agent List
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
  .get(authorize(['customer']), controller.customerlistV2);

module.exports = router;
