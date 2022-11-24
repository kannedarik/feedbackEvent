const express = require('express');
const { celebrate: validate } = require('celebrate');
const { authorize, authorizeKey } = require('../../middlewares/auth');
const controller = require('../../controllers/signingtype.controller');
const {
  create,
  read,
  update,
  remove,
} = require('../../validations/v1/signingtype.validation');

const router = express.Router();

router
  .route('/')
  /**
   * @api {post} api/v1/types Create Signing Type
   * @apiDescription Create Signing Type
   * @apiVersion 1.0.0
   * @apiName Create
   * @apiGroup SigningType
   * @apiPermission admin
   *
   * @apiHeader {String} Authorization  User's access token
   *
   * @apiSuccess {Object} SigningType
   *
   * @apiError (Unauthorized 401)  Unauthorized  Only authenticated users can access the data
   * @apiError (Forbidden 403)     Forbidden     Only admin can access the data
   */
  .post(validate(create), authorize(['admin']), controller.create);

router
  .route('/')
  /**
   * @api {get} api/v1/types List Signing Type
   * @apiDescription List Signing Type
   * @apiVersion 1.0.0
   * @apiName List
   * @apiGroup SigningType
   * @apiPermission client
   *
   * @apiHeader {String} Authorization  User's access token
   *
   * @apiSuccess {Array} SigningTypes
   *
   * @apiError (Unauthorized 401)  Unauthorized  Only authenticated users can access the data
   * @apiError (Forbidden 403)     Forbidden     Only client can access the data
   */
  .get(authorizeKey(), controller.list);

router
  .route('/:id')
  /**
   * @api {get} api/v1/types/:id Read Signing Type
   * @apiDescription Read Signing Type
   * @apiVersion 1.0.0
   * @apiName Read
   * @apiGroup SigningType
   * @apiPermission admin
   *
   * @apiHeader {String} Authorization  User's access token
   *
   * @apiSuccess {Object} SigningType
   *
   * @apiError (Unauthorized 401)  Unauthorized  Only authenticated users can access the data
   * @apiError (Forbidden 403)     Forbidden     Only admin can access the data
   */
  .get(validate(read), authorize(['admin']), controller.read);

router
  .route('/:id')
  /**
   * @api {put} api/v1/types/:id Update Signing Type
   * @apiDescription Update Signing Type
   * @apiVersion 1.0.0
   * @apiName Update
   * @apiGroup SigningType
   * @apiPermission admin
   *
   * @apiHeader {String} Authorization  User's access token
   *
   * @apiSuccess {Object} SigningType
   *
   * @apiError (Unauthorized 401)  Unauthorized  Only authenticated users can access the data
   * @apiError (Forbidden 403)     Forbidden     Only admin can access the data
   */
  .put(validate(update), authorize(['admin']), controller.update);

router
  .route('/:id')
  /**
   * @api {delete} api/v1/types/:id Delete Signing Type
   * @apiDescription Delete Signing Type
   * @apiVersion 1.0.0
   * @apiName Delete
   * @apiGroup SigningType
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
