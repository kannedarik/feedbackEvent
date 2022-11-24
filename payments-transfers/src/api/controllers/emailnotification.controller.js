const _ = require('lodash');
const commons = require('../utils/commons.utils');
const logger = require('../../config/logger').logger;
const Op = require('../models').Sequelize.Op;

const vars = require('../../config/vars');
const responseHandler = require('../utils/helper');
const responseConst = require('../utils/constants/response');
const httpConst = require('../utils/constants/http');

const AxiosRequester = require('../utils/axios-request.util');
const PaymentRequestService = require('../services/paymentrequest.service');
const RazorpayService = require('../services/razorpay.service');

exports.sendEmail = async (req, res, next) => {
  try {
    let responseObj = {};
    let startDate = commons.moment().add(5.5, 'hours').startOf('day');
    let query = {};

    //fetch all payments for the day
    query.createdAt = { [Op.gte]: startDate };
    let failedTransfers = await PaymentRequestService.findAllFailedTransfers(query);

    //create email-body
    let tableheader = ['Payment Id', 'Order Id', 'Amount', 'Date'];
    let rowValues = [];
    _.forEach(failedTransfers, failedTransfer => {
      let row = {};
      row.paymentid = failedTransfer.paymentid;
      row.orderid = failedTransfer.orderid;
      row.amount = failedTransfer.amount;
      row.date = commons.moment(failedTransfer.createdAt).tz('Asia/Kolkata').format();
      rowValues.push(row);
    });

    //send email
    let emailOptions = {
      to: vars.ses.email_list,
      subject: '[ALERT] PENDING TRANSFERS',
    };
    let emailBody = 'Pending transfers for the day:';
    let tableValues = {
      header: tableheader,
      rowValues: rowValues
    }
    let options = {};
    options.headers = {
      'Content-Type': 'application/json',
      'Authorization': vars.ses.email_endpoint_token
    }
    options.data = {
      data: {
        rawData: emailBody,
        tableValues: tableValues
      },
      options: emailOptions
    };
    let emailResponse = await AxiosRequester.axios_request(httpConst.AXIOS_REQUEST.METHODS.POST, vars.ses.email_endpoint, options);
    if (emailResponse.status === httpConst.codes.SUCCESS) {
      logger.info('Sending Email success response', emailResponse);
      responseObj = await responseHandler.getSuccessResponse(responseConst.successCodes.EmailSent);
    }
    else {
      logger.error('Sending Email failed response', emailResponse);
      responseObj = await responseHandler.getErrorResponse(responseConst.errorCodes.EmailFailed);
    }
    return res.status(responseObj.status).send(responseObj);
  }
  catch (error) {
    logger.error('Error occurred in sending mail', error);
    let responseObj = await responseHandler.getErrorResponse(responseConst.errorCodes.Exception);
    return res.status(responseObj.status).send(responseObj);
  }
}

exports.sendEmailUncreatedTransfers = async (req, res, next) => {
  let { days } = req.body;
  await sendDataByEmail(days)
  responseObj = await responseHandler.getSuccessResponse(responseConst.successCodes.Default);
  return res.status(responseObj.status).send(responseObj);
}


const sendDataByEmail = async (days) => {
  try{
    let failedTransfers = await RazorpayService.fetchLastNDaysPaymentsWithNoTransfers(days);
    logger.info('Uncreated transfers:', failedTransfers);
    //create email-body
    let tableheader = ['Payment Id', 'Order Id', 'Amount', 'Date'];
    let rowValues = [];
    _.forEach(failedTransfers, failedTransfer => {
      let row = {};
      row.paymentid = failedTransfer.id;
      row.orderid = _.isEmpty(failedTransfer.notes.order_id) ? 'NA' : failedTransfer.notes.order_id;
      row.amount = failedTransfer.amount;
      row.date = commons.moment(failedTransfer.createdAt).tz('Asia/Kolkata').format();
      rowValues.push(row);
    });

    //send email
    let emailOptions = {
      to: vars.ses.email_list,
      subject: '[ALERT] UNCREATED TRANSFERS',
    };
    let emailBody = 'Uncreated transfers for the day:';
    let tableValues = {
      header: tableheader,
      rowValues: rowValues
    }
    let options = {};
    options.headers = {
      'Content-Type': 'application/json',
      'Authorization': vars.ses.email_endpoint_token
    }
    options.data = {
      data: {
        rawData: emailBody,
        tableValues: tableValues
      },
      options: emailOptions
    };
    let emailResponse = await AxiosRequester.axios_request(httpConst.AXIOS_REQUEST.METHODS.POST, vars.ses.email_endpoint, options);
    if (emailResponse.status === httpConst.codes.SUCCESS) {
      logger.info('Sending Email success response', emailResponse);
    }
    else {
      logger.error('Sending Email failed response', emailResponse);
    }
  } catch(err) {
    logger.error('Error in sending mail for uncreated transfesr', err);
  }
};
