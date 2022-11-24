
const _ = require('lodash');
const axios = require('axios');

const commons = require('../utils/commons.utils');
const logger = require('../../config/logger').logger;
const Op = require('../models').Sequelize.Op;

const razorpayConst = require('../utils/constants/constants').RAZORPAY;
const reqestStatus = require('../utils/constants/constants').PAYMENT_REQUEST_STATUS;
const responseConst = require('../utils/constants/response');
const httpConst = require('../utils/constants/http');
let paymentTypes = require('../utils/constants/constants').PAYMENT_TYPE;
let loanTypes = require('../utils/constants/constants').LOAN_TYPES;

const responseHandler = require('../utils/helper');

const sequelize = require('../models').sequelize;
const PaymentRequestService = require('../services/paymentrequest.service');
const PaymentRequest = sequelize.import('../models/paymentrequest.model');
const CoreService = require('../services/core.service');
const PyamentService = require('../services/payments.service');
const TransferUtil = require('../../api/utils/transfer.util');
const paymentVars = require('../../config/vars').paymentsServiceEndpoints;

exports.unsuccessfulTransfers = async (req, res, next) => {
  const { rowsperpage, pagenum } = req.body;
  let paymentType = paymentTypes.DEFAULT;
  let query = buildQueryFetchFailedTransfers(req, paymentType);
  try {
    let failedTransfers = await PaymentRequestService.findAllFailedTransfers(query, pagenum, rowsperpage);
    let responseObj = {};
    if (_.isEmpty(failedTransfers)) {
      logger.info('No failed transfers found with query', query);
      responseObj = await responseHandler.getSuccessResponse(responseConst.successCodes.Default, failedTransfers);
      return res.status(responseObj.status).send(responseObj);
    }
    failedTransfers = _.forEach(failedTransfers, transfer => {
      failedTransfers.createdat = commons.moment(transfer.createdat).add(5.5, 'hours');
    });
    //populate transfer detail with user details by calling payments service
    let result = await populateFailedTransfersWithUserData(failedTransfers);

    if (!_.isEmpty(result)) {
      responseObj = await responseHandler.getSuccessResponse(responseConst.successCodes.Default, result);
    }
    else responseObj = await responseHandler.getSuccessResponse(responseConst.successCodes.Default, result, 'No failed transfers were found');
    return res.status(responseObj.status).send(responseObj);
  }
  catch (error) {
    logger.error('Error occurred in fetching failed transfers:', error);
    let responseObj = await responseHandler.getErrorResponse(responseConst.errorCodes.Exception);
    return res.status(responseObj.status).send(responseObj);
  }
};

exports.tempVanPayments = async (req, res, next) => {
  const { rowsperpage, pagenum } = req.body;
  let paymentType = paymentTypes.TEMPVAN;
  let query = buildQueryFetchFailedTransfers(req, paymentType);
  try {
    let failedTransfers = await PaymentRequestService.findAllFailedTransfers(query, pagenum, rowsperpage);
    let responseObj = {};
    if (_.isEmpty(failedTransfers)) {
      logger.info('No temp van failed transfers found with query', query);
    }
    failedTransfers = _.forEach(failedTransfers, transfer => {
      failedTransfers.createdat = commons.moment(transfer.createdat).add(5.5, 'hours');
    });
    let response = [];
    _.forEach(failedTransfers, failedTransfer => {
      let transfer = {};
      transfer.paymentid = failedTransfer.paymentid;
      transfer.amount = failedTransfer.amount / 100;
      transfer.createdAt = failedTransfer.createdAt;
      response.push(transfer);
    });
    responseObj = await responseHandler.getSuccessResponse(responseConst.successCodes.Default, response);
    return res.status(responseObj.status).send(responseObj);
  }
  catch (error) {
    let logmsg = { "query": query, "error": error };
    logger.error('Error occurred in fetching temp van failed transfers:', logmsg);
    let responseObj = await responseHandler.getErrorResponse(responseConst.errorCodes.Exception);
    return res.status(responseObj.status).send(responseObj);
  }
}

exports.unlinkedVanPayments = async (req, res, next) => {
  const { rowsperpage, pagenum } = req.body;
  let paymentType = paymentTypes.UNLINKEDVAN;
  let query = buildQueryFetchFailedTransfers(req, paymentType);
  try {
    let failedTransfers = await PaymentRequestService.findAllFailedTransfers(query, pagenum, rowsperpage);
    let responseObj = {};
    if (_.isEmpty(failedTransfers)) {
      logger.info('No unlinked van failed transfers found with query', query);
    }
    failedTransfers = _.forEach(failedTransfers, transfer => {
      failedTransfers.createdat = commons.moment(transfer.createdat).add(5.5, 'hours');
    });
    let response = [];
    _.forEach(failedTransfers, failedTransfer => {
      let transfer = {};
      transfer.paymentid = failedTransfer.paymentid;
      transfer.amount = failedTransfer.amount / 100;
      transfer.createdAt = failedTransfer.createdAt;
      response.push(transfer);
    });
    responseObj = await responseHandler.getSuccessResponse(responseConst.successCodes.Default, response);
    return res.status(responseObj.status).send(responseObj);
  }
  catch (error) {
    logger.error('Error occurred in fetching unlinked van failed transfers:', error);
    let responseObj = await responseHandler.getErrorResponse(responseConst.errorCodes.Exception);
    return res.status(responseObj.status).send(responseObj);
  }
}

exports.createTransfers = async (req, res, next) => {
  const { orderid, paymentid } = req.body;
  let paymentObject = {};
  paymentObject.orderid = orderid;
  paymentObject.paymentid = paymentid;
  paymentObject.currency = razorpayConst.CURRENCY;
  paymentObject.createdby = req.headers['x-consumer-id'];
  let responseObj = {};
  try {
    if (!_.isEmpty(orderid)) {
      const payment = await PaymentRequest.findOne({
        where: {
          [Op.or]: [{ paymentid: paymentid }, { orderid: orderid }],
        }
      });
      if(!_.isEmpty(payment)){
        if (_.isEmpty(paymentObject.paymentid)) {
          paymentObject.paymentid = payment.dataValues.paymentid;
        }
        let transferCreationResponse = await CoreService.processPayment(paymentObject);
        if (!_.isEmpty(transferCreationResponse)) {
          responseObj = await responseHandler.getSuccessResponse(responseConst.successCodes.Default, transferCreationResponse);
        } else responseObj = await responseHandler.getErrorResponse(responseConst.errorCodes.TransferCreationError);
      } else {
        responseObj = await responseHandler.getErrorResponse(responseConst.errorCodes.OrderIdNotFound);
      }
    } else {
      responseObj = await responseHandler.getErrorResponse(responseConst.errorCodes.BadParams);
    }
  }
  catch (error) {
    logger.error('Error occurred in creating transfers:', error);
    responseObj = await responseHandler.getErrorResponse(responseConst.errorCodes.Exception);
  }
  return res.status(responseObj.status).send(responseObj);
}

exports.createMultiLenderTransfers = async (req, res, next) => {
  const { transferMapping, payid } = req.body;
  try {
    if (!_.isEmpty(payid)) {
      let createdby = req.headers['x-consumer-id'];
      let transferCreationResponse = await CoreService.createRazorPayTransfers(payid, transferMapping, createdby);
      if (!_.isEmpty(transferCreationResponse)) {
        PaymentRequestService.changePaymentRequestStatus(payid, reqestStatus.SUCCESS);
        responseObj = await responseHandler.getSuccessResponse(responseConst.successCodes.Default, transferCreationResponse);
      }
      else responseObj = await responseHandler.getErrorResponse(responseConst.errorCodes.TransferCreationError);
    }
    else {
      responseObj = await responseHandler.getErrorResponse(responseConst.errorCodes.BadParams);
    }
  }
  catch (error) {
    logger.error('Error occurred in creating transfers:', error);
    responseObj = await responseHandler.getErrorResponse(responseConst.errorCodes.Exception);
  }
  return res.status(responseObj.status).send(responseObj);
}

exports.retryFailedTransfers = async (req, res, next) => {
  try {
    let responseObj = {};
    let { days } = req.body;
    if (_.isUndefined(days))
      days = 0;
    TransferUtil.retryFailedTransfers(days);
    responseObj = await responseHandler.getSuccessResponse(responseConst.successCodes.Default);
    return res.status(responseObj.status).send(responseObj);
  }
  catch (error) {
    logger.error('Something unexpected happened while retrying failed transfers ', error);
    let responseObj = await responseHandler.getErrorResponse(responseConst.errorCodes.Exception);
    return res.status(responseObj.status).send(responseObj);
  }
}

exports.falselyTaggedTransfers = async (req, res, next) => {
  try {
    let responseObj = {};
    let { days, paymentType } = req.body;
    paymentType = _.toUpper(paymentType);

    if (_.isEmpty(paymentType)) {
      paymentType = paymentTypes.DEFAULT;
    }

    if (!_.includes(paymentTypes, paymentType)) {
      let responseObj = await responseHandler.getErrorResponse(responseConst.errorCodes.BadParams);
      return res.status(responseObj.status).send(responseObj);
    }

    if (_.isUndefined(days))
      days = 0;
    let response = await TransferUtil.countSuccessfulTransfersMarkedFailedOnUI(days, paymentType);
    responseObj = await responseHandler.getSuccessResponse(responseConst.successCodes.Default, response);
    return res.status(responseObj.status).send(responseObj);
  }
  catch (error) {
    logger.error('Something unexpected happened while retrying failed transfers ', error);
    let responseObj = await responseHandler.getErrorResponse(responseConst.errorCodes.Exception);
    return res.status(responseObj.status).send(responseObj);
  }
}

exports.updatePaymentAmount = async (req, res, next) => {
  const { requestids } = req.body;
  let responseObj;
  try {
    let queryParams = {};
    if (!_.isEmpty(requestids)) {
      queryParams.orderid = {
        [Op.in]: _.split(requestids, ','),
      }
    } else {
      queryParams.amount = 0;
    }
    const requestsWithAmountZero = await PaymentRequest.findAll({
      where: queryParams,
      raw: true,
    });

    const requestIdsWithAmountZero = _.map(requestsWithAmountZero, 'orderid');
    logger.info('Found request ids ', requestIdsWithAmountZero);
    if (_.isEmpty(requestIdsWithAmountZero)) {
      responseObj = await responseHandler.getErrorResponse(responseConst.errorCodes.BadParams);
      responseObj.message = 'No request id(s) are present ';
      return res.status(responseObj.status).send(responseObj);
    }
    const options = {
      method: 'POST',
      url: paymentVars.fetch_customer_details_url,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': paymentVars.jwt_token,
      },
      params: {
        requestids: requestIdsWithAmountZero,
      },
      json: true
    }
    logger.info('calling payment service with options',options);
    const response = await axios(options); 
    if (response.status === 200 && _.get(response,'data.response')) {
      logger.info('request ids matching with payments data', _.map(response.data.response, 'requestid'));
      Promise.map(response.data.response, async (paymentrecord) => {
        logger.info(`Payment request with orderid ${paymentrecord.requestid} will be updated with amount ${paymentrecord.amount}`);
        try {
          if (!_.isEmpty(paymentrecord.requestid) && _.isNumber(paymentrecord.amount)) {
            await PaymentRequest.update({ amount: (paymentrecord.amount)*100 }, {
              where: {
                orderid: paymentrecord.requestid,
              }
            });
          } else {
            logger.error(`Failed updating orderid ${paymentrecord.requestid} with amount ${paymentrecord.amount}`);
          }
        } catch (err) {
          logger.error(`Failed updating orderid ${paymentrecord.requestid} with amount ${paymentrecord.amount}`);
        }
      });
      responseObj = await responseHandler.getSuccessResponse(responseConst.successCodes.Default);
      responseObj.message = `Started updating payment requests with correct amounts`;
    }
  } catch (err) {
    logger.error('Error while updating amount in payment request', err);
    responseObj = await responseHandler.getErrorResponse(responseConst.errorCodes.Exception);
  }
  return res.status(responseObj.status).send(responseObj);
}

let buildQueryFetchFailedTransfers = (req, paymenttype) => {
  let query = {};
  const { phoneno, orderid, datestart, dateend, rowsperpage, pagenum } = req.body;
  let startDate = undefined;
  let endDate = undefined;
  //build query
  if (!_.isEmpty(phoneno))
    query.contactno = phoneno;

  if (!_.isEmpty(orderid))
    query.orderid = orderid;

  if (!_.isEmpty(datestart)) {
    startDate = new Date(commons.moment.utc(datestart).format('YYYY-MM-DD'));
    query.createdAt = { [Op.gte]: startDate };
  }
  if (!_.isEmpty(dateend)) {
    endDate = new Date(commons.moment.utc(dateend).format('YYYY-MM-DD'));
    //To include all timestamps after <date> 00:00:00:00
    endDate.setDate(endDate.getDate() + 1);
    query.createdAt = { [Op.lte]: endDate }
  }
  if (datestart > dateend) {
    throw new Error('Invalid date range');
  }
  if (!_.isEmpty(datestart) && !_.isEmpty(dateend)) {
    query.createdAt = {
      [Op.lte]: endDate,
      [Op.gte]: startDate
    }
  }
  query.requeststatus = reqestStatus.FAILED;
  query.paymenttype = paymenttype;
  query.loantype = loanTypes.DEFAULT;
  return query;
}

/**
 * Populates transfer data with user details
 * @param {*} failedTransfers
 */
let populateFailedTransfersWithUserData = async (failedTransfers) => {
  try {
    //get RPKid for the transfers
    orderIds = _.map(failedTransfers, (failedTransfer) => {
      return failedTransfer.orderid;
    });
    orderIds = _.filter(orderIds, orderId => {
      return orderId !== null;
    });
    if (orderIds.length < 1) {
      logger.info('Empty list of order ids, so failed transfers cannot be populated with user data');
      return {};
    }
    let response = await PyamentService.fetchBulkPaymentDetailsFromPaymentsService(orderIds);
    let responseData = {};
    if (response.status === httpConst.codes.SUCCESS) {
      responseData = await mergeListsOnOrderId(failedTransfers, response.response);
    }

    if (_.isEmpty(responseData)) {
      logger.info('No user details were found for the order ids ', orderIds);
      return {};
    }
    else {
      let modifiedResult = [];
      _.forEach(responseData, item => {
        let newItem = {};
        newItem.order_id = item.orderid;
        newItem.name = item.user.firstname + " " + item.user.lastname;
        newItem.contactno = item.user.phone;
        newItem.amount = item.amount / 100;
        newItem.pay_id = item.paymentid;
        newItem.createdat = item.createdAt;
        newItem.type = item.type;
        modifiedResult.push(newItem);
      });
      logger.info('Fetched customer details from payments service with response ', modifiedResult);
      return modifiedResult;
    }
  }
  catch (error) {
    throw error;
  }
}

/**
 * Merges two list on the basis of common key
 * @param {*} list1
 * @param {*} list2
 */
let mergeListsOnOrderId = async (list1, list2) => {
  let result = [];
  _.forEach(list1, item1 => {
    _.forEach(list2, item2 => {
      if (item1.orderid == item2.requestid) {
        let item = _.merge(item2, item1);
        result.push(item);
      }
    })
  });
  return result;
}
