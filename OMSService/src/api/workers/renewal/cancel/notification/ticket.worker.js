const SupportService = require('../../../../services/support.service');
const ErrorHandler = require('../../../../utils/error');
const RenewalOrder = require('../../../../models/renewalorder.model');

module.exports = () => ({
  taskType: 'renewal.cancel.notification.ticket',
  taskHandler: async (job) => {
    try {
      const {
        cancellationReason,
        cancellationComment,
      } = await RenewalOrder.findOne({ _id: job.variables.orderid });

      await SupportService.updateSignStatus(job.variables.orderid, {
        renewal_cancelled: true,
        cancellation_reason: cancellationReason,
        cancellation_comment: cancellationComment,
      });

      job.complete();
    } catch (err) {
      if (job.variables.ignoreticketupdate) {
        job.complete();
      }
      ErrorHandler.captureWFError(job, err);
      job.fail(err.message);
    }
  },
});
