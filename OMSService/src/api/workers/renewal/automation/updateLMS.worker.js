const _ = require('lodash');
const moment = require('moment');
const Promise = require('bluebird');
const { v4: uuidv4 } = require('uuid');
const OrderItem = require('../../../models/orderitem.model');
const OrderPayment = require('../../../models/orderpayment.model');
const OrionService = require('../../../services/orion.service');
const zeebeWorker = require('../../../utils/zeebeWorker');
const { logger } = require('../../../../config/logger');
const { charges, loantype } = require('../../../utils/constants');

const unsecuredBaseSchemes = (orderItem) => _.find(orderItem.meta.newscheme.baseSchemes,
  { type: 'unsecure' });

// Parse a date string, which is assumed to be in the IST timezone.
const parseDay = (dayString) => moment(dayString, 'DD-MM-YYYY').utcOffset('+05:30', true);

const hasNewUnsecureloan = (orderItem) => orderItem.meta.newloantype === loantype.NON_KGL;

const hasOldUnsecureloan = (orderItem) => orderItem.meta.oldloantype === loantype.NON_KGL;

const searchLoan = (loans, loanid) => _.find(loans, (loandata) => loandata.loan.loanid === loanid);

const parseEpochDateTime = (dateTime) => moment.unix(dateTime);

module.exports = zeebeWorker('renewal.automation.updateLMS',
  async (job) => {
    try {
      const orderItems = await OrderItem.find({
        orderId: job.variables.orderid,
      });
      const orderPayments = await OrderPayment.findOne({
        orderId: job.variables.orderid,
      });
      const unsecureOrderItems = orderItems.filter((oi) => hasOldUnsecureloan(oi));
      logger.info('filtered all orderItems having oldloantype = 1:1', unsecureOrderItems);
      let automatedstatus = true;
      await Promise.each(unsecureOrderItems, async (orderItem) => {
        if (hasNewUnsecureloan(orderItem)) {
          logger.info('calling orion renewal api for orderItem', orderItem);
          const processFeeChargeType = _.find(charges, { name: 'processingfee' }).type;
          const unSecureProcessingFeeChargeObject = _.find(
            orderItem.meta.newunsecurecharges, { chargeType: processFeeChargeType },
          );
          const closureDate = parseDay(orderItem.meta.renewalMISData.oldLoanClosureDate);
          const orionResponse = await OrionService.renewRCPLLoan({
            intereststartdate: closureDate.format('YYYY-MM-DD'),
            closuredate: closureDate.format('YYYY-MM-DD'),
            transactiondate: moment().toISOString(),
            interestrate: unsecuredBaseSchemes(orderItem).interestCalculation.interestRate,
            losid: orderItem.meta.unsecurelosid.toString(),
            previouslosid: orderItem.meta.unsecurelosid.toString(),
            referenceid: uuidv4(),
            loanamount: orderItem.meta.newunsecureamount,
            tenure: orderItem.meta.newscheme.tenure,
            schemename: unsecuredBaseSchemes(orderItem).legalName,
            Processingcharge: _.get(unSecureProcessingFeeChargeObject, 'chargeAmount', 0),
            Gstonprocessingcharge: _.get(unSecureProcessingFeeChargeObject, 'taxAmount', 0),
          });
          logger.info('updating new unsecurelmsid with orionResponse', orionResponse);
          if (orionResponse.lmsid) {
            await OrderItem.findOneAndUpdate({ _id: orderItem._id }, { 'meta.newunsecurelmsid': orionResponse.lmsid });
          } else {
            automatedstatus = false;
          }
        } else {
          logger.info('calling orion repayment api for orderItem', orderItem);
          const rtlmData = searchLoan(orderPayments.meta.loandata, orderItem.meta.unsecurelmsid);
          const repaymentResponse = await OrionService.closeRCPLLoan({
            Paymentreqid: orderPayments.requestId,
            payid: orderPayments.meta.pgresponse.payment.entity.id,
            lmsid: orderItem.meta.unsecurelmsid,
            paidbycustomer: rtlmData.loan.closingamount - rtlmData.paidamount,
            paymentdate: parseEpochDateTime(orderPayments.meta.pgresponse.payment.entity.created_at).format('YYYY-MM-DD'),
            cashback: rtlmData.cashback,
            Requesttimestamp: parseEpochDateTime(orderPayments.meta.pgresponse.payment.entity.created_at).format('YYYY-MM-DDTHH:mm:ss.SSS'),
          });
          logger.info('updating automated status  w.r.t repaymentResponse', repaymentResponse);
          automatedstatus = automatedstatus && repaymentResponse.success;
        }
      });
      automatedstatus = automatedstatus && _.every(orderItems,
        (orderItem) => (hasOldUnsecureloan(orderItem) || !hasNewUnsecureloan(orderItem)));
      return job.complete({ automatedstatus });
    } catch (error) {
      logger.error('Error in the update LMS worker:', error);
      return job.complete({ automatedstatus: false });
    }
  });
