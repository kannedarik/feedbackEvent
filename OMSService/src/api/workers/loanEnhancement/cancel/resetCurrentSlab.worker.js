const _ = require('lodash');
const mongoose = require('mongoose');
const PaymentService = require('../../../services/payment.service');
const ErrorHandler = require('../../../utils/error');
const OrderItem = require('../../../models/orderitem.model');
const Constants = require('../../../utils/constants');

module.exports = () => ({
  taskType: 'loanEnhancement.cancel.resetCurrentSlab',
  taskHandler: async (job) => {
    try {
      const { token, orderid } = job.variables;
      const items = await OrderItem.find({
        orderId: mongoose.Types.ObjectId(orderid),
        'meta.repledgetype': Constants.repledgeType.LOAN_ENHANCEMENT,
      });

      if (_.isEmpty(items)) {
        return job.complete();
      }

      const lploanids = _.map(items, 'meta.lmsid');
      await PaymentService.resetCurrentSlab(token, { lploanids });

      return job.complete({ currentSlabs: null });
    } catch (err) {
      ErrorHandler.captureWFError(job, err);
      return job.fail(err.message);
    }
  },
});
