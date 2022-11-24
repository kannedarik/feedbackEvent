const express = require('express');
const { celebrate: validate } = require('celebrate');
const { authorize } = require('../../middlewares/auth');
const controller = require('../../controllers/zeebe.controller');
const {
  deploy,
} = require('../../validations/v1/zeebe.validation');

const router = express.Router();

router
  .route('/deploy')
  /**
   * @api {post} api/v1/zeebe/deploy Deploy Zeebe Workflow
   * @apiDescription Deploy Zeebe Workflow
   * @apiVersion 1.0.0
   * @apiName Deploy
   * @apiGroup Zeebe
   * @apiPermission admin
   *
   * @apiHeader {String} Authorization  User's access token
   *
   * @apiSuccess {Object} ZeebeResponse
   *
   * @apiError (Unauthorized 401)  Unauthorized  Only authenticated users can access the data
   * @apiError (Forbidden 403)     Forbidden     Only admin can access the data
   */
  .post(validate(deploy), authorize(['admin']), controller.deploy);

router
  .route('/publish')
  /**
   * @api {post} api/v1/zeebe/deploy Publish Message
   * @apiDescription Publish Message
   * @apiVersion 1.0.0
   * @apiName Publish
   * @apiGroup Zeebe
   * @apiPermission admin
   *
   * @apiHeader {String} Authorization  User's access token
   *
   * @apiSuccess {Object} ZeebeResponse
   *
   * @apiError (Unauthorized 401)  Unauthorized  Only authenticated users can access the data
   * @apiError (Forbidden 403)     Forbidden     Only admin can access the data
   */
  .post(authorize(['admin']), controller.publish);

module.exports = router;
