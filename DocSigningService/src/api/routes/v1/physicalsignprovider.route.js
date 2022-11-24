const express = require('express');
const { celebrate: validate } = require('celebrate');
const { authorize, authorizeKey } = require('../../middlewares/auth');
const controller = require('../../controllers/physicalsignprovider.controller');
const {
  create,
  read,
  update,
  remove,
} = require('../../validations/v1/physicalsignprovider.validation');

const router = express.Router();

router
  .route('/')
  /**
   * @api {post} api/v1/providers/physical Create PhysicalSign Provider
   * @apiDescription Create PhysicalSign Provider
   * @apiVersion 1.0.0
   * @apiName Create
   * @apiGroup PhysicalSignProvider
   * @apiPermission admin
   *
   * @apiHeader {String} Authorization  User's access token
   *
   * @apiSuccess {Object} PhysicalSignProvider
   *
   * @apiError (Unauthorized 401)  Unauthorized  Only authenticated users can access the data
   * @apiError (Forbidden 403)     Forbidden     Only admin can access the data
   */
  .post(validate(create), authorize(['admin']), controller.create);

router
  .route('/')
  /**
   * @api {get} api/v1/providers/physical List PhysicalSign Provider
   * @apiDescription List PhysicalSign Provider
   * @apiVersion 1.0.0
   * @apiName List
   * @apiGroup PhysicalSignProvider
   * @apiPermission client
   *
   * @apiHeader {String} Authorization  User's access token
   *
   * @apiSuccess {Array} PhysicalSignProviders
   *
   * @apiError (Unauthorized 401)  Unauthorized  Only authenticated users can access the data
   * @apiError (Forbidden 403)     Forbidden     Only client can access the data
   */
  .get(authorizeKey(), controller.list);

router
  .route('/:id')
  /**
   * @api {get} api/v1/providers/physical/:id Read PhysicalSign Provider
   * @apiDescription Read PhysicalSign Provider
   * @apiVersion 1.0.0
   * @apiName Read
   * @apiGroup PhysicalSignProvider
   * @apiPermission admin
   *
   * @apiHeader {String} Authorization  User's access token
   *
   * @apiSuccess {Object} PhysicalSignProvider
   *
   * @apiError (Unauthorized 401)  Unauthorized  Only authenticated users can access the data
   * @apiError (Forbidden 403)     Forbidden     Only admin can access the data
   */
  .get(validate(read), authorize(['admin']), controller.read);

router
  .route('/:id')
  /**
   * @api {put} api/v1/providers/physical/:id Update PhysicalSign Provider
   * @apiDescription Update PhysicalSign Provider
   * @apiVersion 1.0.0
   * @apiName Update
   * @apiGroup PhysicalSignProvider
   * @apiPermission admin
   *
   * @apiHeader {String} Authorization  User's access token
   *
   * @apiSuccess {Object} PhysicalSignProvider
   *
   * @apiError (Unauthorized 401)  Unauthorized  Only authenticated users can access the data
   * @apiError (Forbidden 403)     Forbidden     Only admin can access the data
   */
  .put(validate(update), authorize(['admin']), controller.update);

router
  .route('/:id')
  /**
   * @api {delete} api/v1/providers/physical/:id Delete PhysicalSign Provider
   * @apiDescription Delete PhysicalSign Provider
   * @apiVersion 1.0.0
   * @apiName Delete
   * @apiGroup PhysicalSignProvider
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
