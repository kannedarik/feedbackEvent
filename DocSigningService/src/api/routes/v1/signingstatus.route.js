const express = require('express');
const { celebrate: validate } = require('celebrate');
const { authorize } = require('../../middlewares/auth');
const controller = require('../../controllers/signingstatus.controller');
const {
  create,
  read,
  update,
  remove,
} = require('../../validations/v1/signingstatus.validation');

const router = express.Router();

router
  .route('/')
  /**
   * @api {post} api/v1/statuses Create Signing Status
   * @apiDescription Create Signing Status
   * @apiVersion 1.0.0
   * @apiName Create
   * @apiGroup SigningStatus
   * @apiPermission admin
   *
   * @apiHeader {String} Authorization  User's access token
   *
   * @apiSuccess {Object} SigningStatus
   *
   * @apiError (Unauthorized 401)  Unauthorized  Only authenticated users can access the data
   * @apiError (Forbidden 403)     Forbidden     Only admin can access the data
   */
  .post(validate(create), authorize(['admin']), controller.create);

router
  .route('/')
  /**
   * @api {get} api/v1/statuses List Signing Status
   * @apiDescription List Signing Status
   * @apiVersion 1.0.0
   * @apiName List
   * @apiGroup SigningStatus
   * @apiPermission admin
   *
   * @apiHeader {String} Authorization  User's access token
   *
   * @apiSuccess {Array} SigningStatuses
   *
   * @apiError (Unauthorized 401)  Unauthorized  Only authenticated users can access the data
   * @apiError (Forbidden 403)     Forbidden     Only admin can access the data
   */
  .get(authorize(['admin']), controller.list);

router
  .route('/:id')
  /**
   * @api {get} api/v1/statuses/:id Read Signing Status
   * @apiDescription Read Signing Status
   * @apiVersion 1.0.0
   * @apiName Read
   * @apiGroup SigningStatus
   * @apiPermission admin
   *
   * @apiHeader {String} Authorization  User's access token
   *
   * @apiSuccess {Object} SigningStatus
   *
   * @apiError (Unauthorized 401)  Unauthorized  Only authenticated users can access the data
   * @apiError (Forbidden 403)     Forbidden     Only admin can access the data
   */
  .get(validate(read), authorize(['admin']), controller.read);

router
  .route('/:id')
  /**
   * @api {put} api/v1/statuses/:id Update Signing Status
   * @apiDescription Update Signing Status
   * @apiVersion 1.0.0
   * @apiName Update
   * @apiGroup SigningStatus
   * @apiPermission admin
   *
   * @apiHeader {String} Authorization  User's access token
   *
   * @apiSuccess {Object} SigningStatus
   *
   * @apiError (Unauthorized 401)  Unauthorized  Only authenticated users can access the data
   * @apiError (Forbidden 403)     Forbidden     Only admin can access the data
   */
  .put(validate(update), authorize(['admin']), controller.update);

router
  .route('/:id')
  /**
   * @api {delete} api/v1/statuses/:id Delete Signing Status
   * @apiDescription Delete Signing Status
   * @apiVersion 1.0.0
   * @apiName Delete
   * @apiGroup SigningStatus
   * @apiPermission admin
   *
   * @apiHeader {String} Authorization  User's access token
   *
   * @apiSuccess {Object} sucess/failure
   *
   * @apiError (Unauthorized 401)  Unauthorized  Only authenticated users can access the data
   * @apiError (Forbidden 403)     Forbidden     Only admin can access the data
   */
  .delete(validate(remove), authorize(['admin']), controller.delete);

module.exports = router;
