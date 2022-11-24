const { map } = require('lodash');
const RenewalOrder = require('../../../../models/renewalorder.model');
const CoreService = require('../../../../services/core.service');
const ErrorHandler = require('../../../../utils/error');
const { supportJwtToken } = require('../../../../../config/vars')

module.exports = () => ({
  taskType: 'renewal.cancel.loans.restore',
  taskHandler: async (job) => {
    try {
      const order = await RenewalOrder.findOne({
        _id: job.variables.orderid,
        status: {
          $ne: 'cancelled',
        },
        signingstatus: {
          $in: ['pending', 'failure'],
        },
        'signingmethod.name': {
          $in: ['esign', 'digital', 'physical', '2fa'],
        },
      }).populate('items');

      if (order) {
        const data = {
          repledgerefno: job.variables.orderid,
          loandetails: map(order.items, (item) => ({
            loanid: item.meta.losid,
            ...(item.meta.unsecurelosid && {
              uloanid: item.meta.unsecurelosid,
              scheme: item.meta.oldscheme,
            }),
            oldloantype: item.meta.oldloantype,
          })),
        };
        await CoreService.restoreLoans(supportJwtToken, data);
        return job.complete();
      }

      return job.fail('Order Not Found');
    } catch (err) {
      ErrorHandler.captureWFError(job, err);
      return job.fail(err.message);
    }
  },
});
