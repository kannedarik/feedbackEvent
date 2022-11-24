const moment = require('moment');
const RenewalOrder = require('../../../models/renewalorder.model');
const ErrorHandler = require('../../../utils/error');

module.exports = () => ({
  taskType: 'renewal.order.status',
  taskHandler: async (job) => {
    try {
      const order = await RenewalOrder.findOneAndUpdate({
        _id: job.variables.orderid,
        status: {
          $ne: 'cancelled',
        },
      }, {
        ...(job.customHeaders.status && {
          status: job.customHeaders.status,
          [`timestamps.${job.customHeaders.status}`]: moment().toISOString(),
        }),
        ...(job.customHeaders.paymentstatus && { paymentstatus: job.customHeaders.paymentstatus }),
        ...(job.customHeaders.signingstatus && { signingstatus: job.customHeaders.signingstatus }),
        ...(job.customHeaders.loanstatus && { loanstatus: job.customHeaders.loanstatus }),
        ...(job.customHeaders.locksign && {
          'meta.islocked': job.customHeaders.locksign === 'true',
        }),
        // eslint-disable-next-line max-len
        ...(job.customHeaders.accountverificationstatus && { accountverificationstatus: job.customHeaders.accountverificationstatus }),
        // eslint-disable-next-line max-len
        ...(job.customHeaders.otpconsentstatus && { otpconsentstatus: job.customHeaders.otpconsentstatus }),
        ...(job.customHeaders.lockbankverification && {
          'meta.lockbankverification': job.customHeaders.lockbankverification === 'true',
        }),
        ...(job.customHeaders.automationState && {
          automationState: job.customHeaders.automationState,
        }),
      }, {
        new: true,
      });
      if (order) {
        return job.complete({
          status: order.status,
          signingstatus: order.signingstatus,
          loanstatus: order.loanstatus,
          lockbankverification: order.meta.lockbankverification,
          automationState: order.automationState,
        });
      }
      return job.fail('Order Not Found');
    } catch (err) {
      ErrorHandler.captureWFError(job, err);
      return job.fail(err.message);
    }
  },
});
