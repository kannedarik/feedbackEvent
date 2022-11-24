const _ = require('lodash');
const RenewalOrder = require('../../../../models/renewalorder.model');
const ErrorHandler = require('../../../../utils/error');

module.exports = () => ({
  taskType: 'renewal.cancel.validate',
  taskHandler: async (job) => {
    try {
      const order = await RenewalOrder.findOne({
        _id: job.variables.orderid,
        status: {
          $ne: 'cancelled',
        },
        'meta.cancelledBy': { $exists: true },
      });
      if (!_.isEmpty(order)) {
        return job.complete();
      }
      return  job.fail('Order Not Valid for cancellation');
    } catch (err) {
      ErrorHandler.captureWFError(job, err);
      return  job.fail(err.message);
    }
  },
});
