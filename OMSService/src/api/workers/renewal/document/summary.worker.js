const CoreService = require('../../../services/core.service');
const ErrorHandler = require('../../../utils/error');
const { supportJwtToken } = require('../../../../config/vars');

module.exports = () => ({
  taskType: 'renewal.document.summary',
  taskHandler: async (job) => {
    try {
      const [otp] = job.variables.signingrequests.map((request) => request.otp);
      const { phone } = job.variables;
      const response = await CoreService.generateSummaryPC(supportJwtToken, {
        refno: job.variables.orderid,
        signingmethod: job.variables.signingmethod,
        ...((job.variables.signingmethod === 'digital' || job.variables.signingmethod === '2fa') && {
          otp,
          phone,
        }),
        schemeengine: job.variables.version >= 2,
      });
      job.complete({
        summarydocument: {
          ...(response.link && {
            url: response.link,
          }),
          ...(response.leSummaryLink && {
            lesummaryurl: response.leSummaryLink,
          }),
        },
      });
    } catch (err) {
      ErrorHandler.captureWFError(job, err);
      job.fail(err.message);
    }
  },
});
