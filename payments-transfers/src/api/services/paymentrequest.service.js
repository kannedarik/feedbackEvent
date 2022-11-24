const _ = require('lodash');
const logger = require('../../config/logger').logger;
const sequelize = require('../models').sequelize;

const paymentRequestStatusConst = require('../utils/constants/constants').PAYMENT_REQUEST_STATUS;
const loanTypes = require('../utils/constants/constants').LOAN_TYPES;

const PaymentRequest = sequelize.import('../models/paymentrequest.model');

/**
 * Creates payment request
 * @param {*} paymentRequestObject Payment request object
 * @return Promise<PaymentRequest>
 */
let createPaymentRequest = async (paymentRequestObject) => {
  logger.info('Creating payment request in db', paymentRequestObject);
  let paymentRequest = {};
  try {
    paymentRequest = await PaymentRequest.findOne({ where: { paymentid: paymentRequestObject.paymentid } });
    if (paymentRequest) {
      logger.info('Payment request already exists with same pay id', paymentRequest.dataValues);
    }
    else {
      paymentRequest = await PaymentRequest.create(paymentRequestObject);
    }
    return paymentRequest;
  } catch (error) {
    throw error;
  }
}

/**
 * Creates van payment request
 * @param {*} paymentRequestObject Payment request object
 * @return Promise<PaymentRequest>
 */
let createVanPaymentRequest = async (paymentRequestObject) => {
  logger.info('Creating payment request in db', paymentRequestObject);
  let paymentRequest = {};
  try {
    paymentRequest = await PaymentRequest.findOne({ where: { paymentid: paymentRequestObject.paymentid } });
    //paymentrequest was created by payment.capture event
    if (paymentRequest) {
      logger.info('Payment request already exists with same pay id', paymentRequest.dataValues);
      paymentRequest = await PaymentRequest.update(
        {
          paymenttype: paymentRequestObject.paymenttype,
          requeststatus: paymentRequestObject.requeststatus
        },
        { where: { paymentid: paymentRequestObject.paymentid } }
      );
      if (paymentRequest > 0) {
        paymentRequest = await PaymentRequest.findOne({ where: { paymentid: paymentRequestObject.paymentid } });
        logger.info('Payment request updated', paymentRequest.dataValues);
      }
    }
    else {
      paymentRequest = await PaymentRequest.create(paymentRequestObject);
    }
    return paymentRequest;
  } catch (error) {
    throw error;
  }
}

/**
 * Change the status {CREATED,FAILED,SUCCESS} of the payment request
 * @param {*} orderId Order id of the payment request
 * @param {*} newPaymentRequestStatus New status of the payment request
 */
let changePaymentRequestStatus = async (paymentId, newPaymentRequestStatus) => {
  let logmsg = { "paymentid": paymentId, "new request status": newPaymentRequestStatus };
  logger.info('Changing payment request status', logmsg);
  try {
    let paymentRequest = await PaymentRequest.findOne(
      { where: { paymentid: paymentId } }
    );
    if (paymentRequest.requeststatus === paymentRequestStatusConst.SUCCESS) {
      logmsg = { "paymentid": paymentId };
      logger.info('Payment request is already marked as success', logmsg);
      return paymentRequest;
    }
    else {
      paymentRequest = await PaymentRequest.update(
        { requeststatus: newPaymentRequestStatus },
        { where: { paymentid: paymentId } }
      );
    }
    return paymentRequest;
  } catch (error) {
    throw error;
  }
}

/**
 * Returns all failed transfers as queried by query
 * @param {*} query Query filters
 * @param {*} offset
 * @param {*} limit
 */
let findAllFailedTransfers = async (query, offset, limit, paymenttype) => {
  let failedPaymentRequests = {};
  try {
    failedPaymentRequests = await PaymentRequest.findAll({
      where: query,
      offset,
      limit
    });
    failedPaymentRequests = _.map(failedPaymentRequests, (failedPaymentRequest) => {
      return failedPaymentRequest.dataValues;
    });
    failedPaymentRequests = _.orderBy(failedPaymentRequests, 'createdAt', 'desc');
    return failedPaymentRequests;
  }
  catch (error) {
    throw error;
  }
}

/**
 * Change the lona type of the payment request
 * @param {*} paymentId pay id of the payment request
 * @param {*} loanType New loan type of the payment request
 */
let changeLoanType = async (paymentId, loanType) => {
  let logmsg = { "paymentid": paymentId, "new loan type": loanType };
  logger.info('Changing loan type', logmsg);
  try {
    let paymentRequest = await PaymentRequest.findOne(
      { where: { paymentid: paymentId } }
    );
    //don't allow loan type to be changed if it's not of default type
    if (paymentRequest.loantype !== loanTypes.DEFAULT) {
      logmsg = { "paymentid": paymentId };
      logger.info('Loan type could not be changed', logmsg);
      return paymentRequest;
    }
    else {
      paymentRequest = await PaymentRequest.update(
        { loantype: loanType },
        { where: { paymentid: paymentId } }
      );
    }
    return paymentRequest;
  } catch (error) {
    throw error;
  }
}

const updatePaymentRequestWithParams = async (paymentId, updateParams) => {
  try{
    const updateResponse = await PaymentRequest.update(
      updateParams,
      {
        where: {
          paymentid: paymentId,
        },
      },);
    return updateResponse;
  } catch(err){
    logger.error(`Error in updating ${paymentId}`, err);
  }

};

module.exports = {
  createPaymentRequest,
  changePaymentRequestStatus,
  findAllFailedTransfers,
  createVanPaymentRequest,
  changeLoanType,
  updatePaymentRequestWithParams
}
