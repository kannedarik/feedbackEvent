const _ = require('lodash');
const logger = require('../../config/logger').logger;
const Op = require('../models').Sequelize.Op;

const async = require('async');
const commons = require('../utils/commons.utils');

const requeststatus = require('../../api/utils/constants/constants').PAYMENT_REQUEST_STATUS;
const httpConst = require('../utils/constants/http');

const CoreService = require('../services/core.service');
const RazorpayService = require('../services/razorpay.service');
const PaymentRequestService = require('../services/paymentrequest.service');
const paymentstatus = require('../../api/utils/constants/constants').PAYMENT_STATUS;
const PaymentsService = require('../services/payments.service');

/**
 * @param days no of days to retry failed transfers
 */

exports.retryFailedTransfers = async (days) => {
  try {
    let txnsWithoutTransferCreation = await RazorpayService.fetchLastNDaysPaymentsWithNoTransfers(days);
    let txns = [];
    _.each(txnsWithoutTransferCreation, txn => {
      let rzpTxn = {};
      rzpTxn.paymentid = txn.id;
      rzpTxn.orderid = txn.notes.order_id;
      txns.push(rzpTxn);
    });
    let logmsg = { "count": txns.length, "txns": txns, "days": days };
    logger.info('Fetched transactions', logmsg);
    await Promise.all(
      Promise.each(txnsWithoutTransferCreation, async (txn) => {
        try {
          let paymentObject = {};
          logger.info('Retrying transfer for payment', { "paymentid": txn.id });
          paymentObject.orderid = txn.notes.order_id;
          paymentObject.paymentid = txn.id;
          paymentObject.amount = txn.amount;
          paymentObject.currency = txn.currency;
          paymentObject.notes = txn.notes;
          paymentObject.contact = txn.contact;
          paymentObject.email = txn.email;
          paymentObject.paymentstatus = paymentstatus.CAPTURED;
          if (_.isEmpty(paymentObject.orderid)) {
            logger.info('Orderid is null, fetching orderid from payments service', { 'paymentid': paymentObject.paymentid });
            let response = await PaymentsService.fetchOrderIdFromPaymentsService(paymentObject.paymentid);
            if (response.status === httpConst.codes.SUCCESS) {
              paymentObject.orderid = response.response.order_id;
            }
            else {
              logger.info('No order id was found for payid', { 'paymentid': paymentObject.paymentid });
            }
          }
          await CoreService.processPayment(paymentObject);
          logger.info('Retrying transfer for payment succesful', { "paymentid": txn.id })
        } catch (err) {
          logger.error(`Transfer error for payid: ${txn.id}`, err);
        }
      })
    );
  }
  catch (error) {
    logger.error('Error occurred in retrying failed transfers:', error);
  }
}

exports.countSuccessfulTransfersMarkedFailedOnUI = async (days, paymenttype) => {

  /**
   * 1. Fetch all successful transfers (transfers created) from razorpay
   *  for last @param days days
   */

  try {
    paymenttype = _.toUpper(paymenttype);

    let txnsWithTransfersCreated = await RazorpayService.fetchLastNDaysPaymentsWithTransfers(days);
    let txns = [];
    _.each(txnsWithTransfersCreated, txn => {
      let rzpTxn = {};
      rzpTxn.paymentid = txn.id;
      rzpTxn.orderid = txn.notes.order_id;
      txns.push(rzpTxn);
    });
    let logmsg = { "count": txns.length, "txns": txns, "days": days };
    logger.info('Transactions with successful transfers', logmsg);

    /**
     * 2. Fetch all failed transfers from db for last @param days days
     */

    let endTime = commons.moment().add(5.5, 'hour');
    let startTime = commons.moment(endTime).subtract(days, 'day').startOf('day');
    let query = {};
    query.createdAt = {
      [Op.lte]: endTime,
      [Op.gte]: startTime
    }
    query.requeststatus = requeststatus.FAILED;
    query.paymenttype = paymenttype;

    let failedPaymentsFromDB = await PaymentRequestService.findAllFailedTransfers(query);

    txnsWithTransfersCreated = _.map(txnsWithTransfersCreated, txn => {
      return txn.id;
    });

    failedPaymentsFromDB = _.map(failedPaymentsFromDB, txn => {
      return txn.paymentid;
    });

    //3. Take intersection of both the lists

    let falselyShownFailedTransfers = _.intersection(txnsWithTransfersCreated, failedPaymentsFromDB);

    return falselyShownFailedTransfers;

  }
  catch (error) {
    logger.error('Transfer error ', error);
    throw error;
  }
}
