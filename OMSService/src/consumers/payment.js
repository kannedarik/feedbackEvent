const { chain, includes, toLower } = require('lodash');
const { Consumer } = require('sqs-consumer');
const mongoose = require('../config/mongoose');
const OrderPayment = require('../api/models/orderpayment.model');
const RenewalOrder = require('../api/models/renewalorder.model');
const ZeebeService = require('../api/services/zeebe.service');
const { razorpayAllowedEvents } = require('../api/utils/constants');
const { logger } = require('../config/logger');
const { testing, sqs, isNewrelicEnabled } = require('../config/vars');

if (isNewrelicEnabled) require('newrelic');

// open mongoose connection
mongoose.connect();

logger.info(`Consumer being created for ${sqs.payment}`);

const app = Consumer.create({
  queueUrl: sqs.payment,
  handleMessage: async (message) => {
    logger.info('Payment queue message received', message);
    const body = JSON.parse(message.Body);
    const msg = JSON.parse(body.Message);

    // razorpay service handling
    if (body.MessageAttributes.service.Value === 'razorpay') {
      if (includes(razorpayAllowedEvents, msg.event)) {
        const payment = await OrderPayment.findOne({
          requestId: msg.payload.payment.entity.notes.order_id,
        });

        if (payment) {
          payment.meta = {
            ...payment.meta,
            pgresponse: msg.payload,
          };
          await payment.save();
        }
      }
    }

    // payment service handling
    if (body.MessageAttributes.service.Value === 'payment') {
      const payment = await OrderPayment.findOne({
        requestId: msg.requestid,
      });

      if (payment) {
        payment.status = toLower(msg.status);
        payment.meta = {
          ...payment.meta,
          ...(msg.loandata && { loandata: msg.loandata }),
        };
        await payment.save();

        // check all order docsigning
        const count = await OrderPayment.aggregate([
          {
            $match: {
              orderId: payment.orderId,
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

        if (countMap.success > 0) {
          const order = await RenewalOrder.findOneAndUpdate({
            _id: payment.orderId,
          }, {
            paymentstatus: 'success',
          }, {
            new: true,
          });
          await ZeebeService.publishMessage(order._id.toString(), 'payment_response_event', {
            paymentstatus: order.paymentstatus,
            transactionid: payment.requestId,
            loandata: payment.meta.loandata,
            ...(!testing.DISABLE_PG_RESPONSE_ID_CHECK
              && { pgresponseid: payment.meta.pgresponse.payment.entity.id }),
          });
        }

        if (!payment.retry && countMap.failure > 0 && !countMap.success) {
          const order = await RenewalOrder.findOneAndUpdate({
            _id: payment.orderId,
            paymentstatus: { $ne: 'success' },
          }, {
            paymentstatus: 'failure',
          }, {
            new: true,
          });
          await ZeebeService.publishMessage(order._id.toString(), 'payment_response_event', {
            paymentstatus: order.paymentstatus,
          });
        }
      }
    }
  },
});

app.on('error', (err) => {
  logger.error(err);
});

app.on('processing_error', (err) => {
  logger.error(err);
});

app.on('timeout_error', (err) => {
  logger.error(err);
});

app.start();
