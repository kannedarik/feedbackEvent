// const OrderDocSigning = require('../../../models/orderdocsigning.model');
const ErrorHandler = require('../../../utils/error');

module.exports = () => ({
  taskType: 'renewal.sign.delete',
  taskHandler: async (job) => {
    try {
      // await OrderDocSigning.updateMany({
      //   orderId: job.variables.orderid,
      // }, {
      //   status: 'cancelled',
      // });
      job.complete();
    } catch (err) {
      ErrorHandler.captureWFError(job, err);
      job.fail(err.message);
    }
  },
});
