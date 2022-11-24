const RupeekService = require('../../../../services/rupeek.service');
const ErrorHandler = require('../../../../utils/error');

module.exports = () => ({
  taskType: 'partrelease.salesforce.loan.close',
  taskHandler: async (job) => {
    try {
      const { partreleaseTransactionId, loans } = job.variables;
      const data = {
        loans,
        requestid: partreleaseTransactionId,
      };
      await RupeekService.closeLoan(job.variables.token, data);

      job.complete();
    } catch (err) {
      ErrorHandler.captureWFError(job, err);
      job.fail(err.message);
    }
  },
});
