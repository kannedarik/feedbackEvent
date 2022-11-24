const express = require('express');
const { celebrate: validate } = require('celebrate');
const { authorizeKey } = require('../../middlewares/auth');
const controller = require('../../controllers/signingrequest.controller');
const {
  list,
} = require('../../validations/v1/signingrequest.validation');

const router = express.Router();

router
  .route('/')
  /**
   * @api {get} api/v1/requests List Signing Request
   * @apiDescription List Signing Request
   * @apiVersion 1.0.0
   * @apiName List
   * @apiGroup SigningRequest
   * @apiPermission customer
   *
   * @apiHeader {String} Authorization  User's access token
   *
   * @apiSuccess {Array} SigningRequests
   *
   * @apiError (Unauthorized 401)  Unauthorized  Only authenticated users can access the data
   * @apiError (Forbidden 403)     Forbidden     Only customer can access the data
   */
  .get(validate(list), authorizeKey(), controller.list);

module.exports = router;
