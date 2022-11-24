const express = require('express');
const { celebrate: validate } = require('celebrate');
const { authorize } = require('../../middlewares/auth');
const controller = require('../../controllers/ordertype.controller');
const {
  create,
  read,
  update,
  remove,
} = require('../../validations/v1/ordertype.validation');

const router = express.Router();

router
  .route('/')
  /**
   * @api {post} api/v1/types Create Order Type
   * @apiDescription Create Order Type
   * @apiVersion 1.0.0
   * @apiName Create
   * @apiGroup OrderType
   * @apiPermission admin
   *
   * @apiHeader {String} Authorization  User's access token
   *
   * @apiSuccess {Object} OrderType
   *
   * @apiError (Unauthorized 401)  Unauthorized  Only authenticated users can access the data
   * @apiError (Forbidden 403)     Forbidden     Only admin can access the data
   */
  .post(validate(create), authorize(['admin']), controller.create);

router
  .route('/')
  /**
   * @api {get} api/v1/types List Order Type
   * @apiDescription List Order Type
   * @apiVersion 1.0.0
   * @apiName List
   * @apiGroup OrderType
   * @apiPermission client
   *
   * @apiHeader {String} Authorization  User's access token
   *
   * @apiSuccess {Array} OrderTypes
   *
   * @apiError (Unauthorized 401)  Unauthorized  Only authenticated users can access the data
   * @apiError (Forbidden 403)     Forbidden     Only client can access the data
   */
  .get(authorize(['admin']), controller.list);

router
  .route('/:id')
  /**
   * @api {get} api/v1/types/:id Read Order Type
   * @apiDescription Read Order Type
   * @apiVersion 1.0.0
   * @apiName Read
   * @apiGroup OrderType
   * @apiPermission admin
   *
   * @apiHeader {String} Authorization  User's access token
   *
   * @apiSuccess {Object} OrderType
   *
   * @apiError (Unauthorized 401)  Unauthorized  Only authenticated users can access the data
   * @apiError (Forbidden 403)     Forbidden     Only admin can access the data
   */
  .get(validate(read), authorize(['admin']), controller.read);

router
  .route('/:id')
  /**
   * @api {put} api/v1/types/:id Update Order Type
   * @apiDescription Update Order Type
   * @apiVersion 1.0.0
   * @apiName Update
   * @apiGroup OrderType
   * @apiPermission admin
   *
   * @apiHeader {String} Authorization  User's access token
   *
   * @apiSuccess {Object} OrderType
   *
   * @apiError (Unauthorized 401)  Unauthorized  Only authenticated users can access the data
   * @apiError (Forbidden 403)     Forbidden     Only admin can access the data
   */
  .put(validate(update), authorize(['admin']), controller.update);

router
  .route('/:id')
  /**
   * @api {delete} api/v1/types/:id Delete Order Type
   * @apiDescription Delete Order Type
   * @apiVersion 1.0.0
   * @apiName Delete
   * @apiGroup OrderType
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
