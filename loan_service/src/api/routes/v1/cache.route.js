const express = require('express');
const { celebrate: validate } = require('celebrate');
const { authorize } = require('../../middlewares/auth');
const controller = require('../../controllers/v1/cache.controller');
const lenderController = require('../../controllers/v1/lender.controller');

const {
  read, create, update, remove, setConfig,
} = require('../../validations/cache.validation');

const router = express.Router();

router
  .route('/')
/**
     * @api {get} api/v1/cache Get
     * @apiDescription Get keys from cache
     * @apiVersion 1.0.0
     * @apiName Key List
     * @apiGroup Cache
     * @apiPermission Admin
     *
     * @apiHeader {String} Authorization  User's access token
     *
     * @apiSuccess {Array} agents List of agents.
     *
     * @apiError (Unauthorized 401)  Unauthorized  Only authenticated users can access the data
     * @apiError (Forbidden 403)     Forbidden     Only admin can access the data
     */
  .get(validate(read), authorize(['admin']), controller.read);

router
  .route('/add')
/**
     * @api {get} api/v1/add Create
     * @apiDescription Add a key to cache
     * @apiVersion 1.0.0
     * @apiName Key List
     * @apiGroup Cache
     * @apiPermission Admin
     *
     * @apiHeader {String} Authorization  User's access token
     *
     * @apiSuccess {Array} agents List of agents.
     *
     * @apiError (Unauthorized 401)  Unauthorized  Only authenticated users can access the data
     * @apiError (Forbidden 403)     Forbidden     Only admin can access the data
     */
  .post(validate(create), authorize(['admin']), controller.create);

router
  .route('/update')
/**
     * @api {get} api/v1/update Update
     * @apiDescription Update a key in cache
     * @apiVersion 1.0.0
     * @apiName Key List
     * @apiGroup Cache
     * @apiPermission Admin
     *
     * @apiHeader {String} Authorization  User's access token
     *
     * @apiSuccess {Array} agents List of agents.
     *
     * @apiError (Unauthorized 401)  Unauthorized  Only authenticated users can access the data
     * @apiError (Forbidden 403)     Forbidden     Only admin can access the data
     */
  .put(validate(update), authorize(['admin']), controller.update);

router
  .route('/delete')
/**
     * @api {get} api/v1/delete Delete
     * @apiDescription Delete a key from cache
     * @apiVersion 1.0.0
     * @apiName Key List
     * @apiGroup Cache
     * @apiPermission Admin
     *
     * @apiHeader {String} Authorization  User's access token
     *
     * @apiSuccess {Array} agents List of agents.
     *
     * @apiError (Unauthorized 401)  Unauthorized  Only authenticated users can access the data
     * @apiError (Forbidden 403)     Forbidden     Only admin can access the data
     */
  .delete(validate(remove), authorize(['admin']), controller.delete);

router
  .route('/syncFromCore')
/**
     * @api {get} api/v1/cache/syncFromCore Sync from core
     * @apiDescription Sync keys for all active lenders from core
     * @apiVersion 1.0.0
     * @apiName Key List
     * @apiGroup Cache
     * @apiPermission Admin
     *
     * @apiHeader {String} Authorization  User's access token
     *
     * @apiSuccess {Array} agents List of agents.
     *
     * @apiError (Unauthorized 401)  Unauthorized  Only authenticated users can access the data
     * @apiError (Forbidden 403)     Forbidden     Only admin can access the data
     */
  .post(authorize(['admin']), lenderController.syncCacheFromCore);

router
  .route('/add/config')
/**
     * @api {get} api/v1/cache/setConfig Set config for a lender
     * @apiDescription Set keys for all lender branches
     * @apiVersion 1.0.0
     * @apiName Key List
     * @apiGroup Cache
     * @apiPermission Admin
     *
     * @apiHeader {String} Authorization  User's access token
     *
     * @apiSuccess {Array} agents List of agents.
     *
     * @apiError (Unauthorized 401)  Unauthorized  Only authenticated users can access the data
     * @apiError (Forbidden 403)     Forbidden     Only admin can access the data
     */
  .post(validate(setConfig), authorize(['admin']), lenderController.setConfigForLender);

router
  .route('/discrepancy/message')
/**
     * @api {get} api/v1/cache/discrepancy Fetch discrepancy message
     * @apiDescription
     * @apiVersion 1.0.0
     * @apiName update keys value
     * @apiGroup Cache
     * @apiPermission Admin
     *
     * @apiHeader {String} Authorization  User's access token
     *
     * @apiSuccess {JSON}
     *
     * @apiError (Unauthorized 401)  Unauthorized  Only authenticated users can access the data
     * @apiError (Forbidden 403)     Forbidden     Only admin can access the data
     */
  .get(authorize(['support', 'customer']), controller.fetchdiscrepancymsg);

router
  .route('/discrepancymsg/add')
/**
     * @api {post} api/v1/cache/discrepancymsg/add set discrepancy message
     * @apiDescription
     * @apiVersion 1.0.0
     * @apiName set keys value
     * @apiGroup Cache
     * @apiPermission Admin
     *
     * @apiHeader {String} Authorization  User's access token
     *
     * @apiSuccess {JSON}
     *
     * @apiError (Unauthorized 401)  Unauthorized  Only authenticated users can access the data
     * @apiError (Forbidden 403)     Forbidden     Only admin can access the data
     */
  .post(authorize(['support', 'customer']), controller.setdiscrepancymsg);

module.exports = router;
