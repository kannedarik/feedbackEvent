const express = require('express');
const { authorize } = require('../../middlewares/auth');
const controller = require('../../controllers/client.controller');

const router = express.Router();

router
  .route('/create')
  /**
   * @api {post} api/v1/clients/create create a client for OMS
   * @apiDescription creates a client with the given {name, description}
   * @apiVersion 1.0.0
   * @apiName client
   * @apiGroup client
   * @apiPermission admin
   *
   * @apiHeader {String} Authorization  User's access token
   *
   * @apiSuccess {Array} Orders
   *
   * @apiError (Unauthorized 401)  Unauthorized  Only authenticated users can add the clients
   * @apiError (Forbidden 403)     Forbidden     Only admin can add the clients
   */
  .post(authorize(['admin']), controller.create);

router
  .route('/list')
  /**
   * @api {get} api/v1/clients/list gets all the clients
   * @apiDescription gets all the clients
   * @apiVersion 1.0.0
   * @apiName differentialscheme
   * @apiGroup differentialscheme
   * @apiPermission admin
   *
   * @apiHeader {String} Authorization  User's access token
   *
   * @apiSuccess {Object} Users
   *
   * @apiError (Unauthorized 401)  Unauthorized  Only authenticated users can access the clients
   * @apiError (Forbidden 403)     Forbidden     Only admin can acess the clients
   */
  .get(authorize(['admin']), controller.list);

router
  .route('/update')
  /**
   * @api {post} api/v1/clients/update updates the mentioned client
   * @apiDescription updates the mentioned client
   * @apiVersion 1.0.0
   * @apiName client
   * @apiGroup client
   * @apiPermission admin
   *
   * @apiHeader {String} Authorization  User's access token
   *
   * @apiSuccess {Object} Users
   *
   * @apiError (Unauthorized 401)  Unauthorized  Only authenticated users can update the clients
   * @apiError (Forbidden 403)     Forbidden     Only admin can update the clients
   */
  .put(authorize(['admin']), controller.update);

router
  .route('/delete')
  /**
   * @api {post} api/v1/clients/delete
   * @apiDescription deletes the mentioned clients
   * @apiVersion 1.0.0
   * @apiName clients
   * @apiGroup clients
   * @apiPermission admin
   *
   * @apiHeader {String} Authorization  User's access token
   *
   * @apiSuccess {Object} Users
   *
   * apiError (Unauthorized 401)  Unauthorized  Only authenticated users can delete the clients
   * @apiError (Forbidden 403)     Forbidden     Only admin can delete the clients
   */
  .post(authorize(['admin']), controller.delete);

module.exports = router;
