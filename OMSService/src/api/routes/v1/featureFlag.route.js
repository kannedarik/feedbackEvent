const express = require('express');
const { celebrate: validate } = require('celebrate');
const { authorize } = require('../../middlewares/auth');
const controller = require('../../controllers/featureFlag.controller');
const {
  create,
  remove,
  read,
} = require('../../validations/v1/featureFlag.validation');

const router = express.Router();

router
  .route('/enable')
  /**
   * @api {post} api/v1/feature-flag add users for a feature
   * @apiDescription Add users for a feature-flag
   * @apiVersion 1.0.0
   * @apiName Create
   * @apiGroup feature-flag
   * @apiPermission admin
   *
   * @apiHeader {String} Authorization  User's access token
   *
   * @apiSuccess {Object} Users
   *
   * @apiError (Unauthorized 401)  Unauthorized  Only authenticated users can access the data
   * @apiError (Forbidden 403)     Forbidden     Only admin can access the data
   */
  .post(validate(create), authorize(['admin']), controller.enable);

router
  .route('/showEnabled')
  /**
   * @api {get} api/v1/feature-flag List enabled feature-flag
   * @apiDescription List Order Type
   * @apiVersion 1.0.0
   * @apiName List
   * @apiGroup feature-flag
   * @apiPermission client
   *
   * @apiHeader {String} Authorization  User's access token
   *
   * @apiSuccess {Array} Users with enabled feature-flag
   *
   * @apiError (Unauthorized 401)  Unauthorized  Only authenticated users can access the data
   * @apiError (Forbidden 403)     Forbidden     Only client can access the data
   */
  .get(validate(read), authorize(['admin']), controller.getAllEnabled);

router
  .route('/disable')
  /**
   * @api {delete} api/v1/feature-flag Delete user for a feature
   * @apiDescription Delete users for a feature-flag
   * @apiVersion 1.0.0
   * @apiName Delete
   * @apiGroup feature-flag
   * @apiPermission admin
   *
   * @apiHeader {String} Authorization  User's access token
   *
   * @apiSuccess {Object} sucess/failure
   *
   * @apiError (Unauthorized 401)  Unauthorized  Only authenticated users can access the data
   * @apiError (Forbidden 403)     Forbidden     Only admin can access the data
   */
  .delete(validate(remove), authorize(['admin']), controller.disable);

module.exports = router;
