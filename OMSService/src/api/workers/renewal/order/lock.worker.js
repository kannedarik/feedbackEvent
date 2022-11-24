const moment = require('moment');
const zeebeWorker = require('../../../utils/zeebeWorker');
const RenewalOrder = require('../../../models/renewalorder.model');
const DocSigningCache = require('../../../utils/cache/docsign');
const ErrorHandler = require('../../../utils/error');

module.exports = zeebeWorker('renewal.order.lock',
  async (job) => {
    try {
      const order = await RenewalOrder.findOne({ _id: job.variables.orderid });

      const [method] = await DocSigningCache.getTypes({ name: job.variables.signingmethod }, 'array');
      if (method) {
        order.signingmethod = method; // eslint-disable-line no-param-reassign
      }

      order.signingmethod = method; // eslint-disable-line no-param-reassign
      order.signingstatus = job.variables.signingstatus; // eslint-disable-line no-param-reassign
      order.timestamps.pending = moment().toISOString(); // eslint-disable-line no-param-reassign
      order.meta.islocked = job.variables.locksign; // eslint-disable-line no-param-reassign
      order.markModified('meta.islocked');

      await order.save();

      return job.complete();
    } catch (err) {
      ErrorHandler.captureWFError(job, err);
      return job.fail(err.message);
    }
  });
