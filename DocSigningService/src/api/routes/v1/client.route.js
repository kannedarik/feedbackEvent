const express = require('express');
const { celebrate: validate } = require('celebrate');
const { authorize } = require('../../middlewares/auth');
const controller = require('../../controllers/client.controller');
const {
  create,
  read,
  update,
  remove,
} = require('../../validations/v1/client.validation');

const router = express.Router();

router
  .route('/')
  /**
   * @api {post} api/v1/types Create Client
   * @apiDescription Create Client
   * @apiVersion 1.0.0
   * @apiName Create
   * @apiGroup Client
   * @apiPermission admin
   *
   * @apiHeader {String} Authorization  User's access token
   *
   * @apiSuccess {Object} Client
   *
   * @apiError (Unauthorized 401)  Unauthorized  Only authenticated users can access the data
   * @apiError (Forbidden 403)     Forbidden     Only admin can access the data
   */
  .post(validate(create), authorize(['admin']), controller.create);

router
  .route('/')
  /**
   * @api {get} api/v1/types List Client
   * @apiDescription List Client
   * @apiVersion 1.0.0
   * @apiName List
   * @apiGroup Client
   * @apiPermission admin
   *
   * @apiHeader {String} Authorization  User's access token
   *
   * @apiSuccess {Array} Client
   *
   * @apiError (Unauthorized 401)  Unauthorized  Only authenticated users can access the data
   * @apiError (Forbidden 403)     Forbidden     Only admin can access the data
   */
  .get(authorize(['admin']), controller.list);

router
  .route('/:id')
  /**
   * @api {get} api/v1/types/:id Read Client
   * @apiDescription Read Client
   * @apiVersion 1.0.0
   * @apiName Read
   * @apiGroup Client
   * @apiPermission admin
   *
   * @apiHeader {String} Authorization  User's access token
   *
   * @apiSuccess {Object} Client
   *
   * @apiError (Unauthorized 401)  Unauthorized  Only authenticated users can access the data
   * @apiError (Forbidden 403)     Forbidden     Only admin can access the data
   */
  .get(validate(read), authorize(['admin']), controller.read);

router
  .route('/:id')
  /**
   * @api {put} api/v1/types/:id Update Client
   * @apiDescription Update Client
   * @apiVersion 1.0.0
   * @apiName Update
   * @apiGroup Client
   * @apiPermission admin
   *
   * @apiHeader {String} Authorization  User's access token
   *
   * @apiSuccess {Object} Client
   *
   * @apiError (Unauthorized 401)  Unauthorized  Only authenticated users can access the data
   * @apiError (Forbidden 403)     Forbidden     Only admin can access the data
   */
  .put(validate(update), authorize(['admin']), controller.update);

router
  .route('/:id')
  /**
   * @api {delete} api/v1/types/:id Delete Client
   * @apiDescription Delete Client
   * @apiVersion 1.0.0
   * @apiName Delete
   * @apiGroup Client
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
