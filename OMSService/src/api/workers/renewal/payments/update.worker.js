const { chain, isEmpty } = require('lodash');
const Promise = require('bluebird');
const mongo = require('mongoose');
const RenewalOrder = require('../../../models/renewalorder.model');
const OrderPayment = require('../../../models/orderpayment.model');
const PaymentService = require('../../../services/payment.service');
const ErrorHandler = require('../../../utils/error');
const DateUtil = require('../../../utils/date');

const MAX_RETRY_HOURS = 24;

module.exports = () => ({
  taskType: 'renewal.payments.update',
  taskHandler: async (job) => {
    try {
      const payments = await OrderPayment.find({
        orderId: job.variables.orderid,
        status: 'created',
      });

      await Promise.map(payments, async (payment) => {
        try {
          const response = await PaymentService.getPaymentStatus(job.variables.token, payment.requestId); // eslint-disable-line max-len
          // assumption: 200 gives payment success
          if (response.status === 200) {
            payment.status = 'success'; // eslint-disable-line no-param-reassign
            // eslint-disable-next-line no-param-reassign
            payment.meta = {
              loandata: response.response.data.loandata,
              pgresponse: {
                payment: {
                  entity: response.response.data.pgresponse,
                },
              },
            };
            payment.markModified('meta');
            await payment.save();
          }
        } catch (e) {
          // assumption: 400 gives payment failure
          if (e.response && e.response.status === 400) {
            payment.status = 'failure'; // eslint-disable-line no-param-reassign
            await payment.save();
          }
        }
      });

      // check all order docsigning
      const count = await OrderPayment.aggregate([
        {
          $match: {
            orderId: mongo.Types.ObjectId(job.variables.orderid),
            status: { $ne: 'cancelled' },
          },
        },
        {
          $group: {
            _id: '$status',
            count: {
              $sum: 1,
            },
          },
        },
      ]);
      const countMap = chain(count).keyBy('_id').mapValues('count').value();

      if (isEmpty(countMap)) {
        return job.complete({
          paymentstatus: 'failure',
          continueRecheckPaymentStatus: false,
        });
      }
      if (countMap.success > 0) {
        const order = await RenewalOrder.findOneAndUpdate({
          _id: job.variables.orderid,
        }, {
          paymentstatus: 'success',
        }, {
          new: true,
        });
        const payment = await OrderPayment.findOne({
          status: 'success',
          orderId: order._id,
        });

        if (!payment.meta.pgresponse) {
          const response = await PaymentService.getPaymentStatus(job.variables.token, payment.requestId); // eslint-disable-line max-len

          payment.meta = {
            loandata: response.response.data.loandata,
            pgresponse: {
              payment: {
                entity: response.response.data.pgresponse,
              },
            },
          };
          payment.markModified('meta');
          await payment.save();
        }

        return job.complete({
          paymentstatus: order.paymentstatus,
          transactionid: payment.requestId,
          loandata: payment.meta.loandata,
          pgresponseid: payment.meta.pgresponse.payment.entity.id,
          continueRecheckPaymentStatus: false,
        });
      }
      if (countMap.failure > 0 && !countMap.success) {
        const order = await RenewalOrder.findOneAndUpdate({
          _id: job.variables.orderid,
          paymentstatus: { $ne: 'success' },
        }, {
          paymentstatus: 'failure',
        }, {
          new: true,
        });
        return job.complete({
          paymentstatus: order.paymentstatus,
          continueRecheckPaymentStatus: DateUtil.isHoursPassedLessThan(
            order.createdAt, MAX_RETRY_HOURS,
          ),
        });
      }

      return job.fail('Invalid Payment Status');
    } catch (err) {
      ErrorHandler.captureWFError(job, err);
      return job.fail(err.message);
    }
  },
});
