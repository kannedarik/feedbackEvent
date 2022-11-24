const Promise = require('bluebird');
const _ = require('lodash');
const CoreService = require('../../../services/core.service');
const DocSignService = require('../../../services/docsign.service');
const SigningCache = require('../../../utils/cache/docsign');
const ErrorHandler = require('../../../utils/error');
const { services, supportJwtToken } = require('../../../../config/vars');
const { iciciRenewal } = require('../../../utils/constants');

module.exports = () => ({
  taskType: 'renewal.sign.esign',
  taskHandler: async (job) => {
    try {
      const [doc, profile] = await Promise.all([
        CoreService.generateUnSignedEPC(supportJwtToken, {
          refno: job.variables.orderid,
          schemeengine: job.variables.version >= 2,
        }),
        CoreService.getCustomerProfile(supportJwtToken, job.variables.customer.id),
      ]);
      const [provider, type] = await Promise.all([
        SigningCache.getESignProviders('leegality'),
        SigningCache.getTypes('esign'),
      ]);
      const commonData = {
        signer: {
          id: job.variables.customer.id,
          name: profile.customerprofile.customerproofname,
          phone: job.variables.phone,
        },
        type,
        provider,
        order: job.variables.orderid,
        baseurl: `${services.portal.endpoint}${services.portal.esign}/${job.variables.customerorder}`,
        redirecturl: `${services.portal.endpoint}${services.portal.esign}/${job.variables.customerorder}`,
        callbackurl: `${services.webhook.endpoint}${services.webhook.docsign}`,
        purpose: 'Renewal Document',
      };
      const data = [
        {
          document: doc.secureimagedata,
          correlationid: job.variables.securedlender,
          custom: {
            /* eslint-disable-next-line */
            lender:  _.includes(iciciRenewal.lenderSlug, job.variables.securedlender) ? iciciRenewal.renewalLetter.correlationId : job.variables.securedlender,
          },
        },
        ...(doc.unsecureimagedata ? [
          {
            document: doc.unsecureimagedata,
            correlationid: job.variables.unsecuredlender,
            custom: {
              lender: job.variables.unsecuredlender,
            },
          },
        ] : []),
      ];

      const requests = await Promise.map(data, (body) => DocSignService.createESign({
        ...commonData,
        ...body,
      }));
      job.complete({ signingrequests: requests });
    } catch (err) {
      ErrorHandler.captureWFError(job, err);
      job.fail(err.message);
    }
  },
});
