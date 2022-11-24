const httpStatus = require('http-status');
const moment = require('moment');
const OrderType = require('../models/ordertype.model');

/**
 * Create OrderType
 * @public
 */
exports.create = async (req, res, next) => {
  try {
    const ordertype = await OrderType.create(req.body);
    return res.status(httpStatus.CREATED).json({ code: httpStatus.CREATED, message: 'Order Type created successfully', type: ordertype });
  } catch (error) {
    return next(error);
  }
};

/**
 * Read OrderType
 * @public
 */
exports.read = async (req, res, next) => {
  try {
    const ordertype = await OrderType.findOne({ _id: req.params.id, archived: false });

    if (ordertype) {
      return res.status(httpStatus.OK).json({ code: httpStatus.OK, message: 'Order Type fetched successfully', type: ordertype });
    }
    return res.status(httpStatus.NOT_FOUND).json({ code: httpStatus.NOT_FOUND, message: 'Resource not found' });
  } catch (error) {
    return next(error);
  }
};

/**
 * List OrderType
 * @public
 */
exports.list = async (req, res, next) => {
  try {
    const ordertypes = await OrderType.find({ archived: false });

    return res.status(httpStatus.OK).json({ code: httpStatus.OK, message: 'Order Type(s) fetched successfully', types: ordertypes });
  } catch (error) {
    return next(error);
  }
};

/**
 * Update OrderType
 * @public
 */
exports.update = async (req, res, next) => {
  try {
    const ordertype = await OrderType.findOneAndUpdate({
      _id: req.params.id,
      archived: false,
    }, req.body, {
      new: true,
    });

    if (ordertype) {
      return res.status(httpStatus.OK).json({ code: httpStatus.OK, message: 'Order Type updated successfully', type: ordertype });
    }
    return res.status(httpStatus.NOT_FOUND).json({ code: httpStatus.NOT_FOUND, message: 'Resource not found' });
  } catch (error) {
    return next(error);
  }
};

/**
 * Delete OrderType
 * @public
 */
exports.delete = async (req, res, next) => {
  try {
    const ordertype = await OrderType.findOneAndUpdate({
      _id: req.params.id,
      archived: false,
    }, {
      archived: true,
      archivedAt: moment().toISOString(),
    });

    if (ordertype) {
      return res.status(httpStatus.NO_CONTENT);
    }
    return res.status(httpStatus.NOT_FOUND).json({ code: httpStatus.NOT_FOUND, message: 'Resource not found' });
  } catch (error) {
    return next(error);
  }
};
