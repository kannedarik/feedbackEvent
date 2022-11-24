const SupportService = require('../../../../services/support.service');
const ErrorHandler = require('../../../../utils/error');
const RenewalOrder = require('../../../../models/renewalorder.model');

module.exports = () => ({
  taskType: 'loanEnhancement.cancel.notification.ticket',
  taskHandler: async (job) => {
    try {
      const {
        cancellationReason,
        cancellationComment,
      } = await RenewalOrder.findOne({ _id: job.variables.orderid });

      await SupportService.updateLoanEnhancementStatus(job.variables.orderid, {
        le_cancelled: true,
        cancellation_comment: cancellationComment,
        cancellation_reason: cancellationReason,
      });

      job.complete();
    } catch (err) {
      ErrorHandler.captureWFError(job, err);
      job.fail(err.message);
    }
  },
});
