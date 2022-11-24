const { includes } = require('lodash');
const Promise = require('bluebird');
const OrderItems = require('../../../../models/orderitem.model');
const AccountService = require('../../../../services/account.service');
const ErrorHandler = require('../../../../utils/error');
const { accountsSecureLenderList } = require('../../../../utils/constants');
const { logger } = require('../../../../../config/logger');

module.exports = () => ({
  taskType: 'renewal.cancel.accounts.reset',
  taskHandler: async (job) => {
    try {
      const {
        orderid,
      } = job.variables;
      const orderItems = await OrderItems.find({ orderId: orderid });
      logger.info(`Resetting accounts for order ${orderid}`);
      if (includes(accountsSecureLenderList, job.variables.securedlender)) {
        await Promise.map(orderItems, async (orderItem) => {
          await AccountService.updateLoanStatus(orderItem.meta.lmsid,orderItem.meta.lender, 'OPENED');
          if (orderItem.meta.unsecurelmsid && orderItem.meta.unsecurelender) {
            await AccountService.updateLoanStatus(orderItem.meta.unsecurelmsid, orderItem.meta.unsecurelender,'OPENED');
          }
        });
      }
      job.complete();
    } catch (err) {
      ErrorHandler.captureWFError(job, err);
      job.fail(err.message);
    }
  },
});
