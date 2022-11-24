const DocSignService = require('../../../services/docsign.service');
const SigningCache = require('../../../utils/cache/docsign');
const ErrorHandler = require('../../../utils/error');
const { services } = require('../../../../config/vars');

module.exports = () => ({
  taskType: 'renewal.sign.digital',
  taskHandler: async (job) => {
    try {
      const [provider, type] = await Promise.all([
        SigningCache.getDigitSignProviders('notification/sms'),
        SigningCache.getTypes(job.variables.signingmethod),
      ]);
      const data = {
        signer: {
          id: job.variables.customer.id,
          name: job.variables.customer.name,
          phone: job.variables.phone,
        },
        type,
        provider,
        order: job.variables.orderid,
        correlationid: 'rfpl',
        callbackurl: `${services.webhook.endpoint}${services.webhook.docsign}`,
      };
      const request = await DocSignService.createDigiSign(data);
      job.complete({ signingrequests: [request] });
    } catch (err) {
      ErrorHandler.captureWFError(job, err);
      job.fail(err.message);
    }
  },
});
