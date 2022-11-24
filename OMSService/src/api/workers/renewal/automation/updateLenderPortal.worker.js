const _ = require('lodash');
const zeebeWorker = require('../../../utils/zeebeWorker');
const OrderItems = require('../../../models/orderitem.model');
const CoreService = require('../../../services/core.service');
const { logger } = require('../../../../config/logger');

module.exports = zeebeWorker('renewal.automation.updateLenderPortal',
  async (job) => {
    try {
      const orderItems = await OrderItems.find({
        orderId: job.variables.orderid,
      });

      if (_.isEmpty(orderItems)) {
        return job.fail('No order items for this order');
      }

      const coreIDs = _.map(orderItems, (orderItem) => orderItem.meta.losid);
      await CoreService.sendLenderNotification(job.variables.token, coreIDs);
      return job.complete();
    } catch (err) {
      logger.error('Error in the update lender portal worker:', err);
      return job.error('renewal_automation_error', err.message);
    }
  });
