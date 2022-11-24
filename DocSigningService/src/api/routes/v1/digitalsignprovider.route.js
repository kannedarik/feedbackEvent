const express = require('express');
const { celebrate: validate } = require('celebrate');
const { authorize, authorizeKey } = require('../../middlewares/auth');
const controller = require('../../controllers/digitalsignprovider.controller');
const {
  create,
  read,
  update,
  remove,
} = require('../../validations/v1/digitalsignprovider.validation');

const router = express.Router();

router
  .route('/')
  /**
   * @api {post} api/v1/providers/digital Create DigitalSign Provider
   * @apiDescription Create DigitalSign Provider
   * @apiVersion 1.0.0
   * @apiName Create
   * @apiGroup DigitalSignProvider
   * @apiPermission admin
   *
   * @apiHeader {String} Authorization  User's access token
   *
   * @apiSuccess {Object} DigitalSignProvider
   *
   * @apiError (Unauthorized 401)  Unauthorized  Only authenticated users can access the data
   * @apiError (Forbidden 403)     Forbidden     Only admin can access the data
   */
  .post(validate(create), authorize(['admin']), controller.create);

router
  .route('/')
  /**
   * @api {get} api/v1/providers/digital List DigitalSign Provider
   * @apiDescription List DigitalSign Provider
   * @apiVersion 1.0.0
   * @apiName List
   * @apiGroup DigitalSignProvider
   * @apiPermission client
   *
   * @apiHeader {String} Authorization  User's access token
   *
   * @apiSuccess {Array} DigitalSignProviders
   *
   * @apiError (Unauthorized 401)  Unauthorized  Only authenticated users can access the data
   * @apiError (Forbidden 403)     Forbidden     Only client can access the data
   */
  .get(authorizeKey(), controller.list);

router
  .route('/:id')
  /**
   * @api {get} api/v1/providers/digital/:id Read DigitalSign Provider
   * @apiDescription Read DigitalSign Provider
   * @apiVersion 1.0.0
   * @apiName Read
   * @apiGroup DigitalSignProvider
   * @apiPermission admin
   *
   * @apiHeader {String} Authorization  User's access token
   *
   * @apiSuccess {Object} DigitalSignProvider
   *
   * @apiError (Unauthorized 401)  Unauthorized  Only authenticated users can access the data
   * @apiError (Forbidden 403)     Forbidden     Only admin can access the data
   */
  .get(validate(read), authorize(['admin']), controller.read);

router
  .route('/:id')
  /**
   * @api {put} api/v1/providers/digital/:id Update DigitalSign Provider
   * @apiDescription Update DigitalSign Provider
   * @apiVersion 1.0.0
   * @apiName Update
   * @apiGroup DigitalSignProvider
   * @apiPermission admin
   *
   * @apiHeader {String} Authorization  User's access token
   *
   * @apiSuccess {Object} DigitalSignProvider
   *
   * @apiError (Unauthorized 401)  Unauthorized  Only authenticated users can access the data
   * @apiError (Forbidden 403)     Forbidden     Only admin can access the data
   */
  .put(validate(update), authorize(['admin']), controller.update);

router
  .route('/:id')
  /**
   * @api {delete} api/v1/providers/digital/:id Delete DigitalSign Provider
   * @apiDescription Delete DigitalSign Provider
   * @apiVersion 1.0.0
   * @apiName Delete
   * @apiGroup DigitalSignProvider
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
