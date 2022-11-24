const _ = require('lodash');
const logger = require('../../config/logger').logger;

const paymentStatusConst = require('../utils/constants/constants').PAYMENT_STATUS;

/**
 * Parses message recieved, and returns the razorpay payment information
 * @param {*} message
 * @param {*} isVanPaymentObject If the source of message is recieved from van payment
 * @returns parsed payment object
 */
let getRazorpayPaymentObject = (message, isVanPaymentObject) => {
  let isValidRequestObject = true;
  let parsedPaymentObject = {};
  try {
    let paymentEntity = message.payload.payment.entity;
    parsedPaymentObject = {
      paymentid: paymentEntity.id,
      orderid: paymentEntity.notes.order_id,
      amount: paymentEntity.amount,
      paymentstatus: paymentStatusConst.CAPTURED,
      contactno: paymentEntity.contact,
      currency: paymentEntity.currency,
      notes: paymentEntity.notes
    }
    //mandatory params should be present to process payment
    if (_.isEmpty(parsedPaymentObject.paymentid)) {
      isValidRequestObject = false;
    }
    //orderid should be present if payment is not vanpayment
    if (!isVanPaymentObject && _.isEmpty(parsedPaymentObject.orderid)) {
      isValidRequestObject = false;
    }
  }
  catch (error) {
    logger.error('Error occurred in parsing payment object:', error);
  }
  return { isValidRequestObject: isValidRequestObject, body: parsedPaymentObject };
}

let getVirtualAccountObject = (message) => {
  let virtualAccountObject = {};
  try {
    let virtualAccountEntity = message.payload.virtual_account.entity;
    virtualAccountObject = {
      id: virtualAccountEntity.id,
      name: virtualAccountEntity.name,
      status: virtualAccountEntity.status,
      customerid: virtualAccountEntity.customer_id,
      recievers: virtualAccountEntity.receivers,
      notes: virtualAccountEntity.notes
    }
  }
  catch (error) {
    logger.error('Error occurred in getting virtual account object from message:', error);
  }
  return virtualAccountObject;
}

module.exports = {
  getRazorpayPaymentObject,
  getVirtualAccountObject
}
