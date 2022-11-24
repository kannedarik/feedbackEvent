const {
  compact, find, isEmpty, map, sumBy, uniq, get, split, omit, includes, isBoolean,
} = require('lodash');
const mongoose = require('mongoose');
const httpStatus = require('http-status');
const moment = require('moment');
const Order = require('../models/order.model');
const OrderItem = require('../models/orderitem.model');
const OrderPayment = require('../models/orderpayment.model');
const OrderBankAccount = require('../models/orderbankaccount.model');
const { defaultActiveOrderStatus } = require('../utils/constants');
const APIError = require('../utils/APIError');

const fetchOrdersOfLmsIds = async (params) => {
  const { lmsIds, userId, statusOfOrders } = params;
  const orderIdObjectArray = await OrderItem.find({
    'meta.lmsid': {
      $in: lmsIds,
    }
  }).select('orderId -_id');
  const orderIdsOfItems = uniq(map(orderIdObjectArray, (order) => mongoose.Types.ObjectId(order.orderId)));
  const orders = await Order.find({
    customerId: userId,
    status: {
      $in: statusOfOrders,
    },
    paymentstatus: 'success',
    _id: {
      $in: orderIdsOfItems,
    },
  })
    .populate({
      path: 'type',
    })
    .populate({
      path: 'items',
      match: { 'meta.lmsid': { $in: lmsIds } },
    });
  return orders;
}

/**
 * Active Orders
 * @public
 */
exports.active = async (req, res, next) => {
  try {
    const statusOfOrders = (!isEmpty(req.query.status)) ? split(req.query.status, ',') : defaultActiveOrderStatus;
    const isLightWeight = isBoolean(req.query.lightweight) ? req.query.lightweight : true;
    const lmsIds = (!isEmpty(req.query.loans)) ? split(req.query.loans, ',') : [];
    const { roles } = req.user;
    const isSupportToken = !(!isEmpty(roles) && roles.length === 1 && includes(roles, 'customer'));
    const customerId = (isSupportToken) ? req.query.customerId : req.user.id;
    if (isEmpty(customerId)) {
      throw new APIError({ status: httpStatus.BAD_REQUEST, message: 'Please provide customerId' });
    }
    const orders = (isEmpty(lmsIds)) ? await Order.find({
      customerId,
      status: {
        $in: statusOfOrders,
      },
      paymentstatus: 'success',
    }).populate('type items') : await fetchOrdersOfLmsIds({ userId: customerId, lmsIds, statusOfOrders });

    const orderIds = map(orders, '_id');
    const orderBankAccounts = await OrderBankAccount.find({
      orderId: orderIds,
    });

    const transformedData = (isLightWeight) ? map(orders, (order) => {
      const orderBankAccount = find(orderBankAccounts, { orderId: order._id });
      let bankAccount = { verificationLock: get(order, ['meta', 'lockbankverification'], false) };

      if (!isEmpty(orderBankAccount)) {
        bankAccount = {
          verificationStatus: orderBankAccount.verificationStatus,
          retryCount: orderBankAccount.retryCount,
          verificationLock: order.meta.lockbankverification,
          pendingOtpRetryAttempts: orderBankAccount.pendingOtpRetryAttempts,
          pendingAccountEntryAttempts: orderBankAccount.pendingAccountEntryAttempts,
        };
      }

      return {
        id: order.orderId,
        type: order.type.name,
        lenders: [
          ...(uniq(compact(map(order.items, (item) => item.meta.lender)))),
          ...(uniq(compact(map(order.items, (item) => item.meta.unsecurelender)))),
        ],
        loans: map(order.items, (item) => ({
          loandate: moment(item.meta.oldloandate).format('D MMM, YY'),
          loanamount: item.meta.oldsecureamount + (item.meta.oldunsecureamount || 0),
          loanid: item.meta.losid,
          lmsid: item.meta.lmsid
        })),
        paymentstatus: order.paymentstatus,
        signingstatus: order.signingstatus,
        accountverificationstatus: order.accountverificationstatus,
        otpconsentstatus: order.otpconsentstatus,
        loanstatus: order.loanstatus,
        signingmethod: order.signingmethod.name,
        status: order.status,
        locksign: order.locksign,
        hasLoanEnhancementLoans: order.hasLoanEnhancementLoans,
        bankAccount,
      };
    }) : map(orders, (order) => {
      const orderBankAccount = find(orderBankAccounts, { orderId: order._id });
      let bankAccount = { verificationLock: get(order, ['meta', 'lockbankverification'], false) };

      if (!isEmpty(orderBankAccount)) {
        bankAccount = {
          verificationStatus: orderBankAccount.verificationStatus,
          retryCount: orderBankAccount.retryCount,
          verificationLock: order.meta.lockbankverification,
          pendingOtpRetryAttempts: orderBankAccount.pendingOtpRetryAttempts,
          pendingAccountEntryAttempts: orderBankAccount.pendingAccountEntryAttempts,
        };
      }

      return {
        ...(omit(order._doc, ['__t', '_id', 'orderId', 'type', 'items', 'signingmethod', 'schemedata'])),     
        id: order.orderId,
        type: order.type.name,
        lenders: [
          ...(uniq(compact(map(order.items, (item) => item.meta.lender)))),
          ...(uniq(compact(map(order.items, (item) => item.meta.unsecurelender)))),
        ],
        loans: map(order.items, (item) => ({
          ...(omit(item._doc, ['meta'])),
          meta: { ...omit(item.meta, ['oldscheme', 'newscheme']), ...(item.meta && item.meta.oldscheme && { oldscheme: item.meta.oldscheme.masterSchemeId } ), ...(item.meta && item.meta.newscheme && { newscheme: item.meta.newscheme.masterSchemeId } ) },
          loandate: moment(item.meta.oldloandate).format('D MMM, YY'),
          loanamount: item.meta.oldsecureamount + (item.meta.oldunsecureamount || 0),
          loanid: item.meta.losid,
        })),       
        signingmethod: order.signingmethod.name,
        ...(order.schemedata && { schemedata: order.schemedata.masterSchemeId }),  
        bankAccount,
      };
    });
    const pendingorders = sumBy(transformedData, (order) => ((order.signingstatus !== 'success' && !order.locksign) ? 1 : 0));
    return res.status(httpStatus.OK).json({
      code: httpStatus.OK,
      message: 'Order(s) fetched successfully',
      orders: transformedData,
      count: pendingorders,
    });
  } catch (error) {
    return next(error);
  }
};

/**
 * Fetches orderId by accepting requestId
 * @param req
 * @param res
 * @param next
 * @returns {Promise<*|Format|Promise<any>>}
 */
exports.fetchOrderId = async (req, res, next) => {
  try {
    const orderpayment = await OrderPayment.findOne({
      requestId: req.params.requestId,
    }).populate('orderId');
    if (orderpayment && orderpayment.orderId) {
      return res.status(httpStatus.OK).json({
        code: httpStatus.OK,
        message: 'Order ID fetched successfully',
        orderId: orderpayment.orderId.orderId,
      });
    }
    return res.status(httpStatus.BAD_REQUEST).json({ code: httpStatus.BAD_REQUEST, message: 'Resource not found or already processed' });
  } catch (error) {
    return next(error);
  }
};

/**
 * Active Orders
 * @public
 */
exports.status = async (req, res, next) => {
  try {
    const order = await Order.findOneAndUpdate({
      _id: req.params.id,
      status: {
        $ne: 'cancelled',
      },
    }, {
      status: req.body.status,
      [`timestamps.${req.body.status}`]: moment().toISOString(),
    }, {
      new: true,
    });
    if (order) {
      return res.status(httpStatus.OK).json({ code: httpStatus.OK, message: 'Order status updated successfully' });
    }
    return res.status(httpStatus.BAD_REQUEST).json({ code: httpStatus.BAD_REQUEST, message: 'Resource not found or already processed' });
  } catch (error) {
    return next(error);
  }
};

/**
 * Fetch Order Details based on orderIDs
 * @param req
 * @param res
 * @param next
 * @returns {Promise<*|Format|Promise<any>>}
 */

exports.getOrderDetails = async (req, res, next) => {
  try {
    const { orderIds, loanCard } = req.query;
    const orders = await Order.find({
      _id: {
        $in: split(orderIds, ','),
      },
      customerId: req.user.id,
      status: {
        $ne: 'cancelled',
      },
      paymentstatus: 'success',
      appliedForRenewalAt: {
        $exists: true,
      },
    }).populate('items');

    const transformedData = map(orders, (order) => ({
      id: order._id,
      type: 'renewal',
      lenders: [
        ...(uniq(compact(map(order.items, (item) => item.meta.lender)))),
        ...(uniq(compact(map(order.items, (item) => item.meta.unsecurelender)))),
      ],
      loans: map(order.items, (item) => ({
        loandate: item.meta.newloandate,
        totalnewloanamount: item.meta.newsecureamount + (item.meta.newunsecureamount || 0),
        secureloanid: item.meta.losid,
        startingroi: item.meta.newscheme
          ? item.meta.newscheme.interestCalculation.interestRate : undefined,
        tenure: item.meta.newscheme ? item.meta.newscheme.tenure : undefined,

      })),
      ...(!loanCard && {
        paymentstatus: order.paymentstatus,
        signingstatus: order.signingstatus,
        accountverificationstatus: order.accountverificationstatus,
        otpconsentstatus: order.otpconsentstatus,
        locksign: order.locksign,
        lockbankverification: order.meta.lockbankverification,
        hasLoanEnhancementLoans: order.hasLoanEnhancementLoans,
        appliedForRenewalAt: order.appliedForRenewalAt,
      }),
    }));
    return res.status(httpStatus.OK).json({
      code: httpStatus.OK,
      message: 'Order(s) details fetched successfully',
      orders: transformedData,
    });
  } catch (error) {
    return next(error);
  }
};
