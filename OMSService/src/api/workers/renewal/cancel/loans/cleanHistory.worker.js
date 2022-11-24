const { map } = require('lodash');
const RenewalOrder = require('../../../../models/renewalorder.model');
const CoreService = require('../../../../services/core.service');
const ErrorHandler = require('../../../../utils/error');
const { supportJwtToken } = require('../../../../../config/vars');

module.exports = () => ({
  taskType: 'renewal.cancel.loans.cleanHistory',
  taskHandler: async (job) => {
    try {
      const order = await RenewalOrder.findOne({
        _id: job.variables.orderid,
      }).populate('items');

      if (order) {
        const data = {
          orderrefno: job.variables.orderid,
          customerid: job.variables.customer.id,
          loandetails: map(order.items, (item) => ({
            loanid: item.meta.losid,
          })),
        };
        await CoreService.cleanHistory(supportJwtToken, data);
        return job.complete();
      }

      return job.fail('Order Not Found');
    } catch (err) {
      ErrorHandler.captureWFError(job, err);
      return job.fail(err.message);
    }
  },
});
