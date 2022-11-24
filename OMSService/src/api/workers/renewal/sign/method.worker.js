const RenewalOrder = require('../../../models/renewalorder.model');
const ErrorHandler = require('../../../utils/error');
const { getTypes } = require('../../../utils/cache/docsign');

module.exports = () => ({
  taskType: 'renewal.sign.method',
  taskHandler: async (job) => {
    try {
      const [method] = await getTypes({ name: job.customHeaders.signingmethod }, 'array');

      if (method) {
        const order = await RenewalOrder.findOneAndUpdate({
          _id: job.variables.orderid,
          status: {
            $ne: 'cancelled',
          },
          signingstatus: {
            $ne: 'success',
          },
        }, {
          signingmethod: method,
          signingstatus: 'pending',
        }, {
          new: true,
        });

        if (order) {
          return job.complete({
            oldsigningmethod: job.variables.signingmethod,
            signingmethod: order.signingmethod.name,
            signingstatus: order.signingstatus,
            signingrequests: [],
          });
        }
      }

      return job.complete();
    } catch (err) {
      ErrorHandler.captureWFError(job, err);
      return job.fail(err.message);
    }
  },
});
