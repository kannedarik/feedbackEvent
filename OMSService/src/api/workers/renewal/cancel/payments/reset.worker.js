const { map } = require('lodash');
const OrderPayment = require('../../../../models/orderpayment.model');
const OrderItems = require('../../../../models/orderitem.model');
const PaymentService = require('../../../../services/payment.service');
const ErrorHandler = require('../../../../utils/error');
const { supportJwtToken } = require('../../../../../config/vars');
const { logger } = require('../../../../../config/logger');

module.exports = () => ({
  taskType: 'renewal.cancel.payments.reset',
  taskHandler: async (job) => {
    try {
      const {
        orderid,
      } = job.variables;
      const { requestId } = await OrderPayment.findOne({
        orderId: orderid,
        status: 'success',
      });
      const orderItems = await OrderItems.find({ orderId: orderid });
      const paymentPayload = {
        requestId,
        loans: map(orderItems, (item) => ({
          loanid: item.meta.lmsid,
          uloanid: item.meta.unsecurelmsid,
        })),
      };
      logger.info(`Resetting payments for order ${orderid}`);
      await PaymentService.restorePaymentData(supportJwtToken, paymentPayload);
      job.complete();
    } catch (err) {
      ErrorHandler.captureWFError(job, err);
      job.fail(err.message);
    }
  },
});
