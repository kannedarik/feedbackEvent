const CoreService = require('../../../services/core.service');
const ErrorHandler = require('../../../utils/error');
const { supportJwtToken } = require('../../../../config/vars');

module.exports = () => ({
  taskType: 'renewal.document.digital',
  taskHandler: async (job) => {
    try {
      const [otp] = job.variables.signingrequests.map((request) => request.otp);
      const { phone } = job.variables;
      const response = await CoreService.generateSignedDigiPC(supportJwtToken, {
        refno: job.variables.orderid,
        otp,
        phone,
        schemeengine: job.variables.version >= 2,
      });
      job.complete({
        secureddocument: {
          url: response.signedpcurl,
        },
        ...(response.usignedpcurl && {
          unsecureddocument: {
            url: response.usignedpcurl,
          },
        }),
      });
    } catch (err) {
      ErrorHandler.captureWFError(job, err);
      job.fail(err.message);
    }
  },
});
