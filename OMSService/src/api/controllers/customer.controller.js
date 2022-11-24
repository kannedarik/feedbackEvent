const _ = require('lodash');
const moment = require('moment');
const httpStatus = require('http-status');
const uuid = require('uuid');
const Constants = require('../utils/constants');
const Order = require('../models/order.model');
const RenewalOrder = require('../models/renewalorder.model');
const OrderBankAccount = require('../models/orderbankaccount.model');
const ZeebeService = require('../services/zeebe.service');

const MoneyRoutingService = require('../services/money_routing.service');

// eslint-disable-next-line max-len
const updateOrderBankAccount = async (orderId, accountDetails) => OrderBankAccount.findOneAndUpdate({
  orderId,
}, {
  orderId,
  ...accountDetails,
}, {
  upsert: true,
  new: true,
});

const verificationStatusMapping = Constants.mrs_verification_status_mapping;

const listBankAccounts = async (req, res, next) => {
  try {
    const response = await MoneyRoutingService.listBankAccounts(req.user, true);

    return res.status(httpStatus.OK).json({
      code: httpStatus.OK,
      message: response.message,
      accounts: _.isEmpty(response.data) ? [] : response.data,
    });
  } catch (error) {
    return next(error);
  }
};

const initiatePennyTesting = async (req, res, next) => {
  const { orderId, bankAccount } = req.body;
  try {
    const order = await Order.findOne({ orderId });
    if (!order) {
      return res.status(httpStatus.BAD_REQUEST).json({
        code: httpStatus.BAD_REQUEST,
        message: 'Order not found',
      });
    }

    // Vulnerability fix IP-703
    if (!_.isEqual(order.customerId, req.user.id)) {
      return res.status(httpStatus.FORBIDDEN).json({
        code: httpStatus.FORBIDDEN,
        message: 'you do not have permission to access this resource',
      });
    }

    const response = await MoneyRoutingService.initiatePennyTesting(
      req.user,
      bankAccount,
      uuid.v4(),
    );

    const verificationFlags = verificationStatusMapping[response.data.status];

    const updates = {
      accountNumber: bankAccount.accountNumber,
      transactionId: response.data.transactionId,
      verificationStatus: response.data.status,
      ...verificationFlags,
      statusUpdatedAt: _.get(response, ['data', 'updatedAt']),
    };

    const existingOrderBankAccount = await OrderBankAccount.findOne({
      orderId: order._id,
    });

    if (response.data.status === 'verification_failed') {
      updates.accountEntryAttempts = (existingOrderBankAccount.accountEntryAttempts || 0) + 1;
      updates.latestAccountEntryAt = moment().toISOString();
    }

    const accountNumberHasChanged = updates.accountNumber !== _.get(existingOrderBankAccount, 'accountNumber');
    if (accountNumberHasChanged) {
      updates.retryCount = 0;
    }

    const orderBankAccount = await updateOrderBankAccount(order.id, updates);

    await ZeebeService.publishMessage(order._id.toString(), 'bank_verification_event', {
      accountEntryAttempts: orderBankAccount.accountEntryAttempts || 1,
      retryCount: orderBankAccount.retryCount,
      mrsTransactionId: updates.transactionId,
      accountNumberHasChanged,
      ...verificationFlags,
    });

    return res.status(httpStatus.OK).json({
      code: httpStatus.OK,
      message: response.message,
      accounts: _.set(response.data, 'flags', verificationFlags),
      pendingOtpRetryAttempts: orderBankAccount.pendingOtpRetryAttempts,
      pendingAccountEntryAttempts: orderBankAccount.pendingAccountEntryAttempts,
    });
  } catch (error) {
    return next(error);
  }
};

const resendOTP = async (req, res, next) => {
  const { transactionId } = req.params;
  const { type } = req.query;
  try {
    const orderBankAccount = await OrderBankAccount.findOne({
      transactionId,
    });

    const order = await RenewalOrder.findOne({
      _id: orderBankAccount.orderId.toString(),
    });

    if (!_.isEqual(order.customerId, req.user.id)) {
      return res.status(httpStatus.FORBIDDEN).json({
        code: httpStatus.FORBIDDEN,
        message: 'you do not have permission to access this resource',
      });
    }

    const response = await MoneyRoutingService.resendOTP(transactionId, type);

    return res.status(httpStatus.OK).json({
      code: httpStatus.OK,
      message: response.message,
      accounts: response.data,
    });
  } catch (error) {
    return next(error);
  }
};

const transactionStatus = async (req, res, next) => {
  const { transactionId } = req.params;
  try {
    const orderBankAccount = await OrderBankAccount.findOne({
      transactionId,
    });

    const order = await RenewalOrder.findOne({
      _id: orderBankAccount.orderId.toString(),
    });

    if (!_.isEqual(order.customerId, req.user.id)) {
      return res.status(httpStatus.FORBIDDEN).json({
        code: httpStatus.FORBIDDEN,
        message: 'you do not have permission to access this resource',
      });
    }

    const response = await MoneyRoutingService.transactionStatus(transactionId);

    const verificationFlags = verificationStatusMapping[response.data.status];
    const updates = {
      verificationStatus: response.data.status,
      ...verificationFlags,
      statusUpdatedAt: _.get(response, ['data', 'updatedAt']),
    };

    if (response.data.status === 'verification_failed') {
      updates.accountEntryAttempts = (orderBankAccount.accountEntryAttempts || 0) + 1;
      updates.latestAccountEntryAt = moment().toISOString();
    }

    const updatedOrderBankAccount = await updateOrderBankAccount(orderBankAccount.orderId, updates);

    if (orderBankAccount.accountVerified !== updates.accountVerified
      || orderBankAccount.otpVerified !== updates.otpVerified
      || orderBankAccount.accountEntryAttempts !== updates.accountEntryAttempts) {
      await ZeebeService.publishMessage(
        orderBankAccount.orderId.toString(),
        'bank_verification_event', {
          accountNumberHasChanged: false,
          accountEntryAttempts: updates.accountEntryAttempts,
          ...verificationFlags,
        },
      );
    }

    return res.status(httpStatus.OK).json({
      code: httpStatus.OK,
      message: response.message,
      accounts: _.set(response.data, 'flags', verificationFlags),
      order,
      pendingOtpRetryAttempts: updatedOrderBankAccount.pendingOtpRetryAttempts,
      pendingAccountEntryAttempts: updatedOrderBankAccount.pendingAccountEntryAttempts,
    });
  } catch (error) {
    return next(error);
  }
};

const verifyOTP = async (req, res, next) => {
  const { transactionId } = req.params;
  const { otp } = req.body;
  try {
    let orderBankAccount = await OrderBankAccount.findOne({
      transactionId,
    });

    const order = await RenewalOrder.findOne({
      _id: orderBankAccount.orderId.toString(),
    });

    if (!_.isEqual(order.customerId, req.user.id)) {
      return res.status(httpStatus.FORBIDDEN).json({
        code: httpStatus.FORBIDDEN,
        message: 'you do not have permission to access this resource',
      });
    }

    const response = await MoneyRoutingService.verifyOTP(transactionId, otp);
    const verificationFlags = verificationStatusMapping[response.data.status];
    const updates = {
      verificationStatus: response.data.status,
      retryCount: orderBankAccount.retryCount + 1,
      ...verificationFlags,
    };

    if (updates.retryCount >= Constants.accountVerification.maxOtpRetriesPerAccount) {
      // return error response (Vulnerability fix IP-707)
      return res.status(httpStatus.BAD_REQUEST).json({
        code: httpStatus.FORBIDDEN,
        message: 'No more OTP requests allowed',
      });
    }

    orderBankAccount = await updateOrderBankAccount(orderBankAccount.orderId, updates);

    await ZeebeService.publishMessage(orderBankAccount.orderId.toString(), 'bank_verification_event', {
      accountEntryAttempts: orderBankAccount.accountEntryAttempts,
      accountNumberHasChanged: false,
      retryCount: orderBankAccount.retryCount,
      ...verificationFlags,
    });

    return res.status(httpStatus.OK).json({
      code: httpStatus.OK,
      message: response.message,
      accounts: _.set(response.data, 'flags', verificationFlags),
      pendingOtpRetryAttempts: orderBankAccount.pendingOtpRetryAttempts,
      pendingAccountEntryAttempts: orderBankAccount.pendingAccountEntryAttempts,
    });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  initiatePennyTesting,
  listBankAccounts,
  resendOTP,
  transactionStatus,
  verifyOTP,
};
