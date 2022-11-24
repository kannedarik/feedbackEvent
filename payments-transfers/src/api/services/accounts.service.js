const _ = require('lodash');
const logger = require('../../config/logger').logger;
const https = require('https');

const accountServiceVars = require('../../config/vars').accountServiceVars;
const accountServiceConst = require('../utils/constants/constants').ACCOUNTS_SERVICE;
const httpConst = require('../utils/constants/http');
const errorUtil = require('../utils/error.util');

const PaymentsService = require('../services/payments.service');

const AxiosRequester = require('../utils/axios-request.util');

let notifyAccountsService = async (orderId, transferMappings) => {
  if (_.isEmpty(orderId))
    return {};
  let orderIDS = [];
  orderIDS.push(orderId);
  try {
    let response = await PaymentsService.fetchBulkPaymentDetailsFromPaymentsService(orderIDS);
    if (response.status === httpConst.codes.SUCCESS) {
      paymentDetails = response.response[0];
      await Promise.all(
        Promise.each(transferMappings, async (transferMapping) => {
          let params = {};
          params.loanid = transferMapping.loanid;
          params.cashback = transferMapping.cashback;
          params.paidamount = transferMapping.amount;
          params.type = paymentDetails.type;
          params.source = accountServiceConst.SOURCE.CUST;
          params.amount = paymentDetails.amount;
          logger.info('Updating accounts service with parmas', params);
          let captureResponse = await capturePaymentInAccountService(params);
          logger.info('Response recieved from account service', captureResponse);
        })
      );
    }
    else {
      let errObj = errorUtil.getErrorObject('Fetch Error', 'Error in fetching payment info from payments service', response);
      throw errObj;
    }
  }
  catch (error) {
    logger.error('Error occurred in updating accounts service:', error);
  }
}

let capturePaymentInAccountService = async (params) => {
  let captureResponse = {};
  try {
    let url = accountServiceVars.capture_payment_url;
    const headers = {
      'Content-Type': httpConst.JSON_TYPE,
      'Authorization': accountServiceVars.jwt_token,
      'Host': accountServiceVars.account_service_host
    }
    const agent = new https.Agent({
      rejectUnauthorized: false
    });

    let options = {
      headers: headers,
      data: params,
      agent: agent
    }
    response = await AxiosRequester.axios_request(httpConst.AXIOS_REQUEST.METHODS.POST, url, options);
    if (response.status !== httpConst.codes.SUCCESS) {
      captureResponse = response;
    }
    else {
      captureResponse = response.data;
    }
    return captureResponse;
  }
  catch (error) {
    throw error;
  }

}

module.exports = {
  notifyAccountsService
}
