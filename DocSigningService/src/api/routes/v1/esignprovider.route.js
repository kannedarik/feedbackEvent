const express = require('express');
const { celebrate: validate } = require('celebrate');
const { authorize, authorizeKey } = require('../../middlewares/auth');
const controller = require('../../controllers/esignprovider.controller');
const {
  create,
  read,
  update,
  remove,
} = require('../../validations/v1/esignprovider.validation');

const router = express.Router();

router
  .route('/')
  /**
   * @api {post} api/v1/providers/esign Create ESign Provider
   * @apiDescription Create ESign Provider
   * @apiVersion 1.0.0
   * @apiName Create
   * @apiGroup ESignProvider
   * @apiPermission admin
   *
   * @apiHeader {String} Authorization  User's access token
   *
   * @apiSuccess {Object} ESignProvider
   *
   * @apiError (Unauthorized 401)  Unauthorized  Only authenticated users can access the data
   * @apiError (Forbidden 403)     Forbidden     Only admin can access the data
   */
  .post(validate(create), authorize(['admin']), controller.create);

router
  .route('/')
  /**
   * @api {get} api/v1/providers/esign List ESign Provider
   * @apiDescription List ESign Provider
   * @apiVersion 1.0.0
   * @apiName List
   * @apiGroup ESignProvider
   * @apiPermission client
   *
   * @apiHeader {String} Authorization  User's access token
   *
   * @apiSuccess {Array} ESignProviders
   *
   * @apiError (Unauthorized 401)  Unauthorized  Only authenticated users can access the data
   * @apiError (Forbidden 403)     Forbidden     Only client can access the data
   */
  .get(authorizeKey(), controller.list);

router
  .route('/:id')
  /**
   * @api {get} api/v1/providers/esign/:id Read ESign Provider
   * @apiDescription Read ESign Provider
   * @apiVersion 1.0.0
   * @apiName Read
   * @apiGroup ESignProvider
   * @apiPermission admin
   *
   * @apiHeader {String} Authorization  User's access token
   *
   * @apiSuccess {Object} ESignProvider
   *
   * @apiError (Unauthorized 401)  Unauthorized  Only authenticated users can access the data
   * @apiError (Forbidden 403)     Forbidden     Only admin can access the data
   */
  .get(validate(read), authorize(['admin']), controller.read);

router
  .route('/:id')
  /**
   * @api {put} api/v1/providers/esign/:id Update ESign Provider
   * @apiDescription Update ESign Provider
   * @apiVersion 1.0.0
   * @apiName Update
   * @apiGroup ESignProvider
   * @apiPermission admin
   *
   * @apiHeader {String} Authorization  User's access token
   *
   * @apiSuccess {Object} ESignProvider
   *
   * @apiError (Unauthorized 401)  Unauthorized  Only authenticated users can access the data
   * @apiError (Forbidden 403)     Forbidden     Only admin can access the data
   */
  .put(validate(update), authorize(['admin']), controller.update);

router
  .route('/:id')
  /**
   * @api {delete} api/v1/providers/esign/:id Delete ESign Provider
   * @apiDescription Delete ESign Provider
   * @apiVersion 1.0.0
   * @apiName Delete
   * @apiGroup ESignProvider
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
