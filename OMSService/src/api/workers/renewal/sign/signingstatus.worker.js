const _ = require('lodash');
const RenewalOrder = require('../../../models/renewalorder.model');
const ErrorHandler = require('../../../utils/error');
const ZeebeService = require('../../../services/zeebe.service');

module.exports = () => ({
  taskType: 'renewal.sign.signingstatus',
  taskHandler: async (job) => {
    try {
      const order = await RenewalOrder.findOne({
        _id: job.variables.orderid,
      });
      if (order) {
        if (_.includes(['success', 'failure'], order.signingstatus)) {
          ZeebeService.publishMessage(order._id.toString(), 'signing_callback_event', {
            signingstatus: order.signingstatus,
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
