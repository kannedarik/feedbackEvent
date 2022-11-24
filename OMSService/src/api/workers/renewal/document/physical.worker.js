const CoreService = require('../../../services/core.service');
const ErrorHandler = require('../../../utils/error');
const { supportJwtToken } = require('../../../../config/vars');

module.exports = () => ({
  taskType: 'renewal.document.physical',
  taskHandler: async (job) => {
    try {
      await CoreService.generatePhysicalPC(supportJwtToken, {
        refno: job.variables.orderid,
        schemeengine: job.variables.version >= 2,
      });
      job.complete();
    } catch (err) {
      ErrorHandler.captureWFError(job, err);
      job.fail(err.message);
    }
  },
});
