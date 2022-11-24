const _ = require('lodash');
const logger = require('../../config/logger').logger;

const paymentVars = require('../../config/vars').paymentsServiceEndpoints;
const httpConst = require('../utils/constants/http');

const AxiosRequester = require('../utils/axios-request.util');

let fetchAttributionDetails = async (orderId) => {
  let attributionResponse = {};
  try {
    let url = paymentVars.fetch_attribute_url;
    let options = {};
    options.params = {
      "requestid": orderId
    };
    options.headers = {
      'Content-Type': 'application/json',
      'Authorization': paymentVars.jwt_token
    }
    let logmsg = { "orderid": orderId };
    logger.info('Fetching attribution details from payments service', logmsg);
    let response = await AxiosRequester.axios_request(httpConst.AXIOS_REQUEST.METHODS.GET, url, options);
    if (response.status === httpConst.codes.SUCCESS) {
      attributionResponse = response.data;
    }
    else {
      logger.error('Error occurred in fetching attribution details from payments service', response);
      attributionResponse = response;
    }
    return attributionResponse;
  }
  catch (error) {
    throw error;
  }
}

let fetchOrderID = async (paymentId) => {
  let fetchOrderIdResponse = {};
  try {
    let url = paymentVars.orderid_lookup_url + paymentId;
    let options = {};
    options.headers = {
      'Content-Type': 'application/json',
      'Authorization': paymentVars.jwt_token
    }
    let logmsg = { "paymentid": paymentId };
    logger.info('Fetching order id from payments service', logmsg);
    let response = await AxiosRequester.axios_request(httpConst.AXIOS_REQUEST.METHODS.GET, url, options);
    if (response.status === httpConst.codes.SUCCESS) {
      fetchOrderIdResponse = response.data;
    }
    else {
      logger.error('Error occurred in fetching order id from payments service', response);
      fetchOrderIdResponse = response;
    }
    return fetchOrderIdResponse;
  }
  catch (error) {
    throw error;
  }
}

let fetchPaymentDetails = async (orderIds) => {
  let paymentDetails = {};
  try {
    let url = paymentVars.fetch_customer_details_url;
    let options = {};
    options.headers = {
      'Content-Type': httpConst.JSON_TYPE,
      'Authorization': paymentVars.jwt_token
    }
    options.data = {
      "requestids": orderIds
    }
    let logmsg = { "orderid": orderIds };
    logger.info('Fetching payment details from payments service', logmsg);
    let response = await AxiosRequester.axios_request(httpConst.AXIOS_REQUEST.METHODS.POST, url, options);
    if (response.status === httpConst.codes.SUCCESS) {
      paymentDetails = response.data;
    }
    else {
      logger.error('Error occurred in fetching payment details from payments service', response);
      paymentDetails = response;
    }
    return paymentDetails;
  }
  catch (error) {
    throw error;
  }
}


module.exports = {
  fetchOrderIdFromPaymentsService: fetchOrderID,
  fetchAttributionDetailsFromPaymentsService: fetchAttributionDetails,
  fetchBulkPaymentDetailsFromPaymentsService: fetchPaymentDetails,
}
