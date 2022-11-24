const { map } = require('lodash');
const OrderDocSigning = require('../../../models/orderdocsigning.model');
const ErrorHandler = require('../../../utils/error');

module.exports = () => ({
  taskType: 'renewal.sign.create',
  taskHandler: async (job) => {
    try {
      const requests = map(job.variables.signingrequests, (req) => ({
        orderId: job.variables.orderid,
        requestId: req.id,
      }));
      await OrderDocSigning.create(requests);

      job.complete();
    } catch (err) {
      ErrorHandler.captureWFError(job, err);
      job.fail(err.message);
    }
  },
});
