const {
  chain, find, includes, map,
} = require('lodash');
const mongoose = require('mongoose');
const OrderDocSigning = require('../../../models/orderdocsigning.model');
const DocSignService = require('../../../services/docsign.service');
const { getTypes } = require('../../../utils/cache/docsign');
const { iciciRenewal } = require('../../../utils/constants');
const ErrorHandler = require('../../../utils/error');

module.exports = () => ({
  taskType: 'renewal.document.esign',
  taskHandler: async (job) => {
    try {
      const requests = await OrderDocSigning.find({
        orderId: mongoose.Types.ObjectId(job.variables.orderid),
        status: 'success',
      });
      const type = await getTypes(job.variables.signingmethod);
      const signingrequests = await DocSignService.listRequests({
        order: job.variables.orderid,
        type,
      });

      const requestIDs = map(requests, (request) => request.requestId);
      const transformedData = chain(signingrequests)
        .filter((request) => includes(requestIDs, request._id))
        .value();
      const securedDoc = find(transformedData, (data) => data.custom.lender !== job.variables.unsecuredlender); // eslint-disable-line max-len
      const unSecuredDoc = find(transformedData, (data) => data.custom.lender === job.variables.unsecuredlender); // eslint-disable-line max-len
      const renewalLetter = find(transformedData, (data) => data.custom.lender === iciciRenewal.renewalLetter.correlationId); // eslint-disable-line max-len

      // storing the signeddocument renewal letter.
      if (renewalLetter) {
        await OrderDocSigning.findOneAndUpdate({
          requestId: renewalLetter._id,
        }, {
          meta: renewalLetter,
        });
      }

      job.complete({
        ...(securedDoc && {
          secureddocument: {
            path: securedDoc.signeddocument.path,
            url: securedDoc.signeddocument.url,
          },
        }),
        ...(unSecuredDoc && {
          unsecureddocument: {
            path: unSecuredDoc.signeddocument.path,
            url: unSecuredDoc.signeddocument.url,
          },
        }),
        ...(renewalLetter && {
          renewalLetter: {
            path: renewalLetter.signeddocument.path,
            url: renewalLetter.signeddocument.url,
          },
        }),
      });
    } catch (err) {
      ErrorHandler.captureWFError(job, err);
      job.fail(err.message);
    }
  },
});
