const _ = require('lodash');
const logger = require('../../config/logger').logger;

const requestStatus = require('../utils/constants/constants').PAYMENT_REQUEST_STATUS;//payment req status
const paymentEvents = require('../utils/constants/constants').PAYMENT_REQUEST_EVENTS;
const paymentType = require('../utils/constants/constants').PAYMENT_TYPE;
const loanTypes = require('../utils/constants/constants').LOAN_TYPES;
const lenderConst = require('../utils/constants/constants').LENDERS;
const messageKeyConst = require('../utils/constants/constants').MESSAGE_KEYS;
const httpConst = require('../utils/constants/http');
const errorUtil = require('../utils/error.util');
const commons = require('../utils/commons.utils')

let PaymentRequestService = require('./paymentrequest.service');
let PaymentsService = require('./payments.service');
let RazorpayService = require('./razorpay.service');
let MessageParserService = require('./messageparser.service');
let CacheService = require('./cache.service');
let AccountService = require('./accounts.service');
let TransferService = require('./transfer.service');


/**
 * Listens to the messages sent by listener, and process the transfers
 * @param {*} message Message recieved by Listener
 */

let getNotifiedByListener = async (message) => {
  let paymentInfoObject = {};
  try {
    if (message.event === paymentEvents.CAPTURED) {
      paymentInfoObject = MessageParserService.getRazorpayPaymentObject(message);
      let paymentProcessingResponse = {};
      if (paymentInfoObject.isValidRequestObject) {
        logger.info('Message successfully parsed', paymentInfoObject);
        paymentProcessingResponse = await processPayment(paymentInfoObject.body, true);
        return paymentProcessingResponse;
      }
      else {
        logger.error('Mandatory params missing in the message');
      }
    }
    else if (message.event === paymentEvents.VAN_PAYMENT) {
      paymentInfoObject = MessageParserService.getRazorpayPaymentObject(message, true);
      let paymentProcessingResponse = {};
      if (paymentInfoObject.isValidRequestObject) {
        logger.info('Message successfully parsed', paymentInfoObject);
        let response = await PaymentsService.fetchOrderIdFromPaymentsService(paymentInfoObject.body.paymentid);
        if (response.status === httpConst.codes.SUCCESS) {
          paymentInfoObject.body.orderid = response.response.order_id;
          paymentProcessingResponse = await processPayment(paymentInfoObject.body, true);
          return paymentProcessingResponse;
        }
        else {
          let virtualAccountObject = MessageParserService.getVirtualAccountObject(message);
          paymentProcessingResponse = await processTempOrUnlinkedVanPayment(paymentInfoObject.body, virtualAccountObject);
        }
      }
      else {
        logger.error('Mandatory params missing in the message');
      }
    }
    else {
      logger.error('Message is not captured or van_credited type, so message discarded', message);
    }
  }
  catch (error) {
    throw error;
  }
}

/**
 * Creates payment request and checks if van attribution is possible for the request. If van attribution possible,
 * makes transfers.
 * @param {*} paymentRequestObject
 * @returns
 */
let processPayment = async (paymentObject, razorpayEvent) => {
  let orderId = "";
  let paymentId = "";
  let isPaymentProcessingSuccesful = false;
  let paymentProcssingResponse = {};
  try {
    logger.info('Processing payment with values', { "paymentobject": paymentObject });
    paymentId = paymentObject.paymentid;
    orderId = paymentObject.orderid;

    if (_.isEmpty(paymentId)) {
      throw new Error('Empty payment id');
    }

    //1.Create payment request object and save into db
    let paymentRequest = await PaymentRequestService.createPaymentRequest(paymentObject);
    if (paymentRequest.requeststatus == 'SUCCESS'){
      return true;
    }

    let logmsg = { "paymentid": paymentId, "values": paymentRequest };
    logger.info('Payment request created', logmsg);

    //2.Fetch payment attribution details
    let attributionResponse = {};
    if(!_.isEmpty(paymentObject.attribution)) {
      attributionResponse.response = paymentObject.attribution;
      logger.info('Message received from payments with attribution:', attributionResponse);
    } else {
      if(razorpayEvent){
        logger.info('do not create transfers for event coming throgh razorpay-hook');
        return true;
      }
      attributionResponse = await PaymentsService.fetchAttributionDetailsFromPaymentsService(orderId);
      if (attributionResponse.status !== httpConst.codes.SUCCESS) {
        let error = await errorUtil.getErrorObject('Attribution Error', `Error in fetching attribution details for order id:${orderId}`, attributionResponse);
        throw error;
      }
    }
    /*
    Payment was processed by razorpay hook flow as van payment and we need to update
    payment type and update order id
    */
    if (!_.isEmpty(paymentRequest) && paymentRequest.paymenttype == paymentType.UNLINKEDVAN){
      const updateParams = {
        orderid: orderId,
        paymenttype: paymentType.DEFAULT
      };
      logger.info('Updating payment request with values', updateParams);
      await PaymentRequestService.updatePaymentRequestWithParams(paymentId, updateParams);
    }
    logmsg = { "orderid": orderId, "values": attributionResponse.response };
    logger.info('Fetched attribution details from payments service', logmsg);

    let isValidPaymentAttribution = attributionResponse.response.isValid;
    let transferMapping = {};
    //3. Check if payment attribution is possible
    //3.1 Transfer amount to respective accounts
    if (isValidPaymentAttribution) {
      transferMapping = attributionResponse.response.transferMapping;
      //if payment processing is trigerred by manual process
      let createdby = null;
      if (!_.isEmpty(paymentObject.createdby))
        createdby = paymentObject.createdby;
      let transferResponse = await createRazorPayTransfers(paymentId, transferMapping, createdby);
      if (!_.isEmpty(transferResponse)) {
        logger.info('Transfers were created with values', transferResponse);
        paymentProcssingResponse = transferResponse;
        isPaymentProcessingSuccesful = true;
      }
    }
    //3.2 Mark payment request created in step 1 as FAILED
    else {
      let error = await errorUtil.getErrorObject('Attribution Error', `Order id: ${orderId} couldn't be attributed`);
      throw error;
    }

    //4. Call account service and mark payment request as SUCCESS
    logmsg = { "paymentid": paymentId };
    if (isPaymentProcessingSuccesful) {
      await PaymentRequestService.changePaymentRequestStatus(paymentId, requestStatus.SUCCESS);
      logger.info('Payment processing successful', logmsg);
      // await AccountService.notifyAccountsService(orderId, transferMapping);
    }
    else {
      logger.info('Payment processing unsuccessful', logmsg);
      await PaymentRequestService.changePaymentRequestStatus(paymentId, requestStatus.FAILED);
    }
    return paymentProcssingResponse;
  }
  catch (error) {
    logger.error('Error in processing payment:', error);
    await PaymentRequestService.changePaymentRequestStatus(paymentId, requestStatus.FAILED);
    return {};
  }
}

/**
 * Processes all payments for which payments service cannot resolve order id
 * @param {*} paymentObject
 * @param {*} virtualAccountObject
 */
let processTempOrUnlinkedVanPayment = async (paymentObject, virtualAccountObject) => {
  let paymentId = "";
  try {
    paymentId = paymentObject.paymentid;
    let logmsg = { "paymentobject": paymentObject, "virtualaccountobject": virtualAccountObject };
    logger.info('Processing van payment with details', logmsg);

    /**
     * Changes for Renewal/ Tenure Extension
     * ---------------------------------------
     * Payments service sets notes in paymentobject (purpose = renewal)
     */
    let notes = virtualAccountObject.notes;
    let isRenewalLoan = _.includes(notes.purpose, messageKeyConst.RENEWAL);
    let recieverAccountNo = virtualAccountObject.recievers[0].account_number;//change it
    //payment is made in temp van
    let key = await CacheService.getKey(recieverAccountNo);
    if (!_.isEmpty(key)) {
      paymentObject.paymenttype = paymentType.TEMPVAN;
    }
    else {
      paymentObject.paymenttype = paymentType.UNLINKEDVAN;
    }
    paymentObject.status = requestStatus.FAILED;
    if (isRenewalLoan) {
      paymentObject.loantype = loanTypes.RENEWAL;
    }
    let paymentRequest = await PaymentRequestService.createVanPaymentRequest(paymentObject);
    if (!_.isEmpty(paymentRequest.dataValues))
      logger.info('Created payment request for temp or unlinked VAN payment', paymentRequest.dataValues);

    if (isRenewalLoan) {
      //create transfer mappings
      let transferResponse = await createTransfersForRenewalLoans(paymentObject);
      if (!_.isEmpty(transferResponse)) {
        logger.info('Successfully processed transfer for renewal/tenure extension loan', paymentObject);
        await PaymentRequestService.changePaymentRequestStatus(paymentId, requestStatus.SUCCESS);
      }
      else {
        throw new Error('Error in processing transfer for renewal/ tenure extension loan');
      }
    } else {
      throw new Error('Van payment is not of renewal type');
    }
  }
  catch (error) {
    logger.error('Error in processing temp or unlinked VAN payment:', error);
    await PaymentRequestService.changePaymentRequestStatus(paymentId, requestStatus.FAILED);
  }
}

/**
 * Created razorpay transfers  as defined in @transferMappings
 * @param {*} paymentId
 * @param {*} transferMappings
 * @param {*} createdby id of the user creating transfers, not null only if the transfer is created manually
 */
let createRazorPayTransfers = async (paymentId, transferMappings, createdby) => {
  try {
    //Create transfers only for accounts having amount greater than 0
    transferMappings = _.filter(transferMappings, transferMapping => {
      return transferMapping.amount > 0;
    });

    /**
     *      Changes for Takeover Loan
     * -----------------------------------
     * Payment service sets a field {isTakeOverLoan} in @param transferMappings to identify it as takeover payment
     * If this field is set: we will transfer money to the takeover lender
     * Note: For takeover loans, (lenderid === RUPEEK)
     * Just set the lenderid to the appropriate lender id
     */
    await Promise.all(
      Promise.each(transferMappings, async (transferMapping) => {
        if (transferMapping.isTakeoverLoan && transferMapping.lenderid === lenderConst.RUPEEK) {
          transferMapping.lenderid = lenderConst.TAKEOVER;
          //update db to mark it as takeover loan
          await PaymentRequestService.changeLoanType(paymentId, loanTypes.TAKEOVER);
        }
      })
    );

    let transferResponse = await RazorpayService.transferPayments(paymentId, transferMappings);

    if (!_.isEmpty(createdby)) {
      _.forEach(transferResponse, transfer => {
        transfer.createdby = createdby;
        transfer.manual = true;
      });
    }
    logger.info('Saving razorpay transfers into db with values', transferResponse);
    let transfers = await TransferService.createTransfers(transferResponse);
    return transfers;
  }
  catch (error) {
    let errorObj = await errorUtil.getErrorObject('Transfer Error', `Error in creating transfers for payment id: ${paymentId}`, error);
    throw errorObj;
  }
}

/**
 * Creates transfers for renewal loans/ tenure extension
 * @param {*} paymentObject
 */
let createTransfersForRenewalLoans = async (paymentObject) => {
  let razorpayTransferResponse = {};
  try {
    let paymentId = paymentObject.paymentid;
    let transferMappings = [{
      amount: paymentObject.amount / 100,
      currency: paymentObject.currency,
      lenderid: lenderConst.RENEWAL
    }];
    razorpayTransferResponse = await createRazorPayTransfers(paymentId, transferMappings);
  }
  catch (error) {
    logger.error('Error occurred in creating transfers for renewal/ tenure extension loans', error);
  }
  return razorpayTransferResponse;
}

module.exports = {
  notifyCoreService: getNotifiedByListener,
  createRazorPayTransfers,
  processPayment
}
