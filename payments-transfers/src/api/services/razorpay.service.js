const _ = require('lodash');
const logger = require('../../config/logger').logger;
const commons = require('../utils/commons.utils');

const razorpay_vars = require('../../config/vars').razorpay;
const httpConstant = require('../utils/constants/http');
const razorpayCurrency = require('../utils/constants/constants').RAZORPAY.CURRENCY;
const razorpayStatus = require('../utils/constants/constants').RAZORPAY.PAYMENT_STATUS;
const errorUtil = require('../utils/error.util');

const AxiosRequester = require('../utils/axios-request.util');
const LenderAccountService = require('./lenderaccountdetails.service');

/**
 * Creates Razorpay transfers
 * @param {*} paymentObject
 * @param {*} transferMappings
 */
let transferPayments = async (paymentId, transferMappings) => {
  let razorpayTransfers = {};
  try {
    let url = razorpay_vars.url + razorpay_vars.payment_uri;
    url += '/' + paymentId + razorpay_vars.transfer_uri;
    transfers = [];
    await Promise.all(
      Promise.each(transferMappings, async (transferMapping) => {
        let transfer = {};
        let lenderAccount = await LenderAccountService.getLenderAccountNo(transferMapping.lenderid);
        transfer.account = lenderAccount.accountid;
        transfer.amount = transferMapping.amount * 100;
        transfer.currency = !_.isEmpty(transferMapping.currency) ? transferMapping.currency : razorpayCurrency.INR;
        transfers.push(transfer);
      })
    );
    let options = {};
    options.headers = {
      'Content-Type': httpConstant.JSON_TYPE,
    };
    options.data = {};
    options.data.transfers = transfers;
    options.auth = {
      username: razorpay_vars.PUBLIC_KEY,
      password: razorpay_vars.PRIVATE_KEY
    }
    let logmsg = { "paymentid": paymentId, "body": options.data };
    logger.info('Calling razorpay api with values', logmsg);
    let response = await AxiosRequester.axios_request(httpConstant.AXIOS_REQUEST.METHODS.POST, url, options);
    if (!_.isEmpty(response) && !_.isEmpty(response.data)){
      logger.info('Response recieved from Razorpay', response.data);
    }
    if (response.status !== httpConstant.codes.SUCCESS) {
      throw response;
    }
    razorpayTransfers = fetchTransferInformation(response.data);
    return razorpayTransfers;
  }
  catch (error) {
    throw error;
  }
}

let fetchLastNDaysPaymentsWithNoTransfers = async (lastNDays) => {
  try {
    let endTime = commons.moment().add(5.5, 'hour');
    let startTime = commons.moment(endTime).subtract(lastNDays, 'day').startOf('day');
    let url = razorpay_vars.url + razorpay_vars.payment_uri;
    let options = {};
    options.headers = {
      'Content-Type': httpConstant.JSON_TYPE,
    };
    options.auth = {
      username: razorpay_vars.PUBLIC_KEY,
      password: razorpay_vars.PRIVATE_KEY
    }
    let payments = [];
    let hasMore = true;
    let logmsg = { "start date": startTime, "end date": endTime };
    logger.info('Fetching razorpay txns with date filter', logmsg);
    while (hasMore) {
      let paramsStr = '?from=' + startTime.unix() + '&to=' + endTime.unix() + '&count=100&skip=' + payments.length;
      url += paramsStr;
      let response = await AxiosRequester.axios_request(httpConstant.AXIOS_REQUEST.METHODS.GET, url, options);
      logmsg = { "param string": paramsStr }
      logger.info('Fetching bulk txns from razorpay with params', logmsg);
      if (response.status === httpConstant.codes.SUCCESS) {
        _.each(response.data.items, (item) => {
          return payments.push(item);
        });
        if (response.data.items.length > 0) {
          if (payments.length % 100 != 0 || payments.length == 0) {
            hasMore = false;
          }
        }
        else {
          hasMore = false;
        }
      } else {
        logger.error('Error in fetching bulk txns from razorpay', response);
        let errorObj = errorUtil.getErrorObject('Razorpay Error', 'Error in fetching txns from razorpay', error);
        throw errorObj;
      }
    }
    let filteredPaymentState = _.filter(payments, (payment) => {
      return payment.status === razorpayStatus.CAPTURED;
    });

    let untransferredPayments = [];
    await Promise.each(filteredPaymentState, async txn => {
      let transferDetails = await fetchTransferDetailsFromRazorpay(txn.id);
      if (transferDetails.length < 1) {
        untransferredPayments.push(txn);
      }
      return;
    });
    logmsg = { "Total txns": payments.length, "Captured txns": filteredPaymentState.length, "Txns with no Transfers": untransferredPayments.length }
    logger.info('Fetched transactions stats from razorpay', logmsg);
    return untransferredPayments;
  }
  catch (error) {
    logger.error('Something unexpected happened while fetching transfers ', error);
    throw error;
  }
}

let fetchLastNDaysPaymentsWithTransfers = async (lastNDays) => {
  try {
    let endTime = commons.moment().add(5.5, 'hour');
    let startTime = commons.moment(endTime).subtract(lastNDays, 'day').startOf('day');
    let url = razorpay_vars.url + razorpay_vars.payment_uri;
    let options = {};
    options.headers = {
      'Content-Type': httpConstant.JSON_TYPE,
    };
    options.auth = {
      username: razorpay_vars.PUBLIC_KEY,
      password: razorpay_vars.PRIVATE_KEY
    }
    let payments = [];
    let hasMore = true;
    let logmsg = { "start date": startTime, "end date": endTime };
    logger.info('Fetching razorpay txns with date filter', logmsg);
    while (hasMore) {
      let paramsStr = '?from=' + startTime.unix() + '&to=' + endTime.unix() + '&count=100&skip=' + payments.length;
      url += paramsStr;
      let response = await AxiosRequester.axios_request(httpConstant.AXIOS_REQUEST.METHODS.GET, url, options);
      logmsg = { "param string": paramsStr }
      logger.info('Fetching bulk txns from razorpay with params', logmsg);
      if (response.status === httpConstant.codes.SUCCESS) {
        _.each(response.data.items, (item) => {
          return payments.push(item);
        });
        if (response.data.items.length > 0) {
          if (payments.length % 100 != 0 || payments.length == 0) {
            hasMore = false;
          }
        }
        else {
          hasMore = false;
        }
      } else {
        logger.error('Error in fetching bulk txns from razorpay', response);
        let errorObj = errorUtil.getErrorObject('Razorpay Error', 'Error in fetching txns from razorpay', error);
        throw errorObj;
      }
    }
    let filteredPaymentState = _.filter(payments, (payment) => {
      return payment.status === razorpayStatus.CAPTURED;
    });

    let txnsWithTransfersCreated = [];
    await Promise.each(filteredPaymentState, async txn => {
      let transferDetails = await fetchTransferDetailsFromRazorpay(txn.id);
      if (transferDetails.length > 0) {
        txnsWithTransfersCreated.push(txn);
      }
      return;
    });
    logmsg = { "Total txns": payments.length, "Captured txns": filteredPaymentState.length, "Txns with Transfers created": txnsWithTransfersCreated.length }
    logger.info('Fetched transactions stats from razorpay', logmsg);
    return txnsWithTransfersCreated;
  }
  catch (error) {
    logger.error('Something unexpected happened while fetching transfers ', error);
    throw error;
  }
}

let fetchTransferDetailsFromRazorpay = async (txn_id) => {
  try {
    let options = {};
    options.headers = {
      'Content-Type': httpConstant.JSON_TYPE,
    };
    options.auth = {
      username: razorpay_vars.PUBLIC_KEY,
      password: razorpay_vars.PRIVATE_KEY
    };
    let url = razorpay_vars.url + razorpay_vars.payment_uri;
    url += '/' + txn_id + razorpay_vars.transfer_uri;
    let response = await AxiosRequester.axios_request(httpConstant.AXIOS_REQUEST.METHODS.GET, url, options);
    if (response.status === httpConstant.codes.SUCCESS) {
      return response.data.items;
    }
    else {
      logger.error(`Error occurred in fetching transfer details for txn id ${txn_id} `, response);
      return [];
    }
  }
  catch (error) {
    logger.error(`Something unexpected happended while fetching transfer details for txn id ${txn_id} `, error);
  }
}

/**
 * Extracts transfer info from razorpay transfer response
 * @param {*} response Response from razorpay
 */
let fetchTransferInformation = (response) => {
  let transfers = [];
  if (_.isEmpty(response)) {
    return transfers;
  }
  if (response.items.length > 0) {
    let items = response.items;
    _.each(items, item => {
      let transfer = {};
      transfer.amount = item.amount;
      transfer.paymentid = item.source;
      transfer.manual = false;
      transfers.push(transfer);
    });
  }
  return transfers;
}


module.exports = {
  transferPayments,
  fetchLastNDaysPaymentsWithNoTransfers,
  fetchLastNDaysPaymentsWithTransfers
}
