const httpStatus = require('http-status');
const Order = require('../models/renewalorder.model');
const ZeebeService = require('../services/zeebe.service');
const OrderBankAccount = require('../models/orderbankaccount.model');
const MoneyRoutingService = require('../services/money_routing.service');

exports.publishSigningStatus = async (req, res, next) => {
  try {
    const order = await Order.findOne({
      orderId: req.params.orderId,
    });
    if (order) {
      if (order.signingstatus === 'success') {
        await ZeebeService.publishMessage(order._id.toString(), 'signing_callback_event', {
          signingstatus: order.signingstatus,
        });
        return res.status(httpStatus.OK).json({ code: httpStatus.OK, message: 'signing status published successfully' });
      }
      return res.status(httpStatus.OK).json({ code: httpStatus.OK, message: `signing status not published.The signing status of the order is ${order.signingstatus}` });
    }

    return res.status(httpStatus.BAD_REQUEST).json({ code: httpStatus.BAD_REQUEST, message: 'Order not found' });
  } catch (error) {
    return next(error);
  }
};

exports.getBankAccountDetails = async (req, res, next) => {
  try {
    const orderAccount = await OrderBankAccount.findOne({
      orderId: req.params.orderId,
    });
    if (orderAccount) {
      const response = await MoneyRoutingService.getBankAccountDetails(orderAccount.accountNumber, true);
      return res.status(httpStatus.OK).json({ code: httpStatus.OK, message: 'Fetched Bank details successfully', accountDetails: response.data });
    }
    return res.status(httpStatus.BAD_REQUEST).json({ code: httpStatus.BAD_REQUEST, message: 'Account Number for the given order Id not found' });
  } catch (error) {
    return next(error);
  }
};
