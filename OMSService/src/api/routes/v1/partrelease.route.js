const express = require('express');
const { celebrate: validate } = require('celebrate');
const { authorize } = require('../../middlewares/auth');
const controller = require('../../controllers/partrelease.controller');
const {
  create,
  slot,
} = require('../../validations/v1/partrelease.validation');

const router = express.Router();

router
  .route('/case')
  /**
   * @api {post} api/v1/partrelease/case
   * @apiDescription Create partrelease case on salesforce
   * @apiVersion 1.0.0
   * @apiName Create partrelease case on salesforce
   * @apiGroup PF in salesforce
   * @apiPermission Agent
   *
   * @apiHeader {String} Authorization  User's access token
   *
   * @apiSuccess {Object} Partrelease case
   *
   * @apiError (Unauthorized 401)  Unauthorized
   * @apiError (Forbidden 403)     Forbidden
   */
  .post(validate(create, { allowUnknown: true }), authorize(['support']), controller.create);

router
  .route('/slot')
  /**
   * @api {post} api/v1/partrelease/slot
   * @apiDescription Confirm slot for part release on salesforce
   * @apiVersion 1.0.0
   * @apiName Confirm slot for part release on salesforce
   * @apiGroup PF in salesforce
   * @apiPermission Agent
   *
   * @apiHeader {String} Authorization User's access token
   *
   * @apiSuccess {Object} Partrelease case
   *
   * @apiError (Unauthorized 401) Unauthorized
   * @apiError (Forbidden 403) Forbidden
   */
  .post(validate(slot, { allowUnknown: true }), authorize(['support']), controller.slot);

module.exports = router;
