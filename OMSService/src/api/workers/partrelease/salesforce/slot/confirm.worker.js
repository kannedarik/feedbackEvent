const InsightService = require('../../../../services/insight.service');
const ErrorHandler = require('../../../../utils/error');

module.exports = () => ({
  taskType: 'partrelease.salesforce.slot.confirm',
  taskHandler: async (job) => {
    try {
      const { token, slotId } = job.variables;
      const data = {
        requestid: job.variables.partreleaseTransactionId,
        agentsrequired: job.variables.agentsrequired,
      };
      const { slot: confirmedSlot } = await InsightService.confirmSlot(token, slotId, data);
      job.complete({ confirmedSlot });
    } catch (err) {
      ErrorHandler.captureWFError(job, err);
      job.fail(err.message);
    }
  },
});
