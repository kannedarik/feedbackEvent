const express = require('express');
const { celebrate: validate } = require('celebrate');
const { authorize } = require('../../middlewares/auth');
const controller = require('../../controllers/order.controller');
const { fetchOrderId, status, orderdetails, activeOrders } = require('../../validations/v1/order.validation');

const router = express.Router();

router
  .route('/active')
  /**
   * @api {get} api/v1/orders/active List Active Order
   * @apiDescription List Active Order
   * @apiVersion 1.0.0
   * @apiName Active
   * @apiGroup Order
   * @apiPermission customer
   *
   * @apiHeader {String} Authorization  User's access token
   *
   * @apiSuccess {Array} Orders
   *
   * @apiError (Unauthorized 401)  Unauthorized  Only authenticated users can access the data
   * @apiError (Forbidden 403)     Forbidden     Only customer can access the data
   */
  .get(validate(activeOrders), authorize(['customer', 'support']), controller.active);

router
  .route('/payment/:requestId')
  /**
   * @api {get} api/v1/orders/payment/:requestId Fetch orderId from requestId
   * @apiDescription Fetch Order Id from requestId
   * @apiVersion 1.0.0
   * @apiName Active
   * @apiGroup Order
   * @apiPermission customer
   *
   * @apiHeader {String} Authorization  User's access token
   *
   * @apiSuccess {Array} Orders
   *
   * @apiError (Unauthorized 401)  Unauthorized  Only authenticated users can access the data
   * @apiError (Forbidden 403)     Forbidden     Only customer can access the data
   */
  .get(validate(fetchOrderId), authorize(['customer']), controller.fetchOrderId);

router
  .route('/:id/status')
  /**
   * @api {put} api/v1/orders/:id/status Update Order Status
   * @apiDescription Update Order Status
   * @apiVersion 1.0.0
   * @apiName Status
   * @apiGroup Order
   * @apiPermission admin
   *
   * @apiHeader {String} Authorization  User's access token
   *
   * @apiSuccess {Array} Orders
   *
   * @apiError (Unauthorized 401)  Unauthorized  Only authenticated users can access the data
   * @apiError (Forbidden 403)     Forbidden     Only admin can access the data
   */
  .put(validate(status), authorize(['admin', 'branchmanager', 'lenderclerk', 'banker']), controller.status);

router
  .route('/orderdetails')
  /**
   * @api {get} api/v1/orders/orderdetails List Order Details
   * @apiDescription List the order details for given orderIds
   * @apiVersion 1.0.0
   * @apiName Status
   * @apiGroup Order
   * @apiPermission admin
   *
   * @apiHeader {String} Authorization  User's access token
   *
   * @apiSuccess {Array} Orders
   *
   * @apiError (Unauthorized 401)  Unauthorized  Only authenticated users can access the data
   * @apiError (Forbidden 403)     Forbidden     Only admin can access the data
   */
  .get(validate(orderdetails), authorize(['customer']), controller.getOrderDetails);

module.exports = router;
