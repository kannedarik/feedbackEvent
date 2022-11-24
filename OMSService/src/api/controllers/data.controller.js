const {
  compact, map, isEmpty, flattenDeep,
} = require('lodash');
const httpStatus = require('http-status');
const moment = require('moment');
const orderItem = require('../models/orderitem.model');
const order = require('../models/order.model');

/**
 * Renewal related data for list of lms ids
 * @private
 */
exports.data = async (req, res, next) => {
  try {
    const renewalData = await orderItem.find({
      'meta.lmsid': { $in: req.body.lmsids },
    })
      .populate('orderId', null, { paymentstatus: 'success' });
    const renewalDataTransformed = compact(map(renewalData, (item) => {
      if (!isEmpty(item.orderId)) {
        return {
          lmsid: item.meta.lmsid,
          losid: item.meta.losid,
          newloanamount: item.meta.newsecureamount,
          oldloanamount: item.meta.oldsecureamount,
          tenureextension: item.orderId.meta.tenureextension,
        };
      }
      return null;
    }));
    return res.status(httpStatus.OK).json({
      message: 'Data fetched successfully',
      data: renewalDataTransformed,
    });
  } catch (error) {
    return next(error);
  }
};

/**
 * Bulk data for all complete renewals between a specific date range
 * @private
 */
exports.bulkRenewalData = async (req, res, next) => {
  try {
    const start = moment(req.query.date, 'DD-MM-YYYY').startOf('day').toISOString();
    const end = moment(req.query.date, 'DD-MM-YYYY').endOf('day').toISOString();
    const renewalData = await order.find({
      'timestamps.created': { $gt: start, $lt: end },
      loanstatus: 'success',
      paymentstatus: 'success',
      status: { $ne: 'cancelled' },
    }).populate('items').lean();
    const renewalDataTransformed = flattenDeep(map(renewalData, (renewalOrder) => {
      const { tenureextension } = renewalOrder.meta;
      const itemdata = map(renewalOrder.items, (item) => ({
        lmsid: item.meta.lmsid,
        losid: item.meta.losid,
        newloanamount: item.meta.newsecureamount,
        oldloanamount: item.meta.oldsecureamount,
        tenureextension,
      }));
      return itemdata;
    }));
    return res.status(httpStatus.OK).json({
      code: httpStatus.OK,
      message: 'Data fetched properly',
      data: renewalDataTransformed,
    });
  } catch (error) {
    return next(error);
  }
};
