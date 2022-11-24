const httpStatus = require('http-status');
const OrderType = require('../../models/ordertype.model');
const RenewalOrder = require('../../models/renewalorder.model');

/**
 * Create RenewalOrder V3 API
 * @public
 */
exports.create = async (req, res, next) => {
  try {
    const ordertype = await OrderType.findOne({ name: 'renewal', archived: false });
    const order = await RenewalOrder.createOrder(req.body, ordertype, req.user, false, 3);
    return res.status(httpStatus.CREATED).json({ code: httpStatus.CREATED, message: 'Renewal Order created successfully', order: order.orderId });
  } catch (error) {
    return next(error);
  }
};
