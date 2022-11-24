const { chain, isEqual } = require('lodash');
const { Consumer } = require('sqs-consumer');
const mongo = require('mongoose');
const mongoose = require('../config/mongoose');
const OrderDocSigning = require('../api/models/orderdocsigning.model');
const RenewalOrder = require('../api/models/renewalorder.model');
const ZeebeService = require('../api/services/zeebe.service');
const { logger } = require('../config/logger');
const { testing, sqs, isNewrelicEnabled } = require('../config/vars');

if (isNewrelicEnabled) require('newrelic');

// open mongoose connection
mongoose.connect();

logger.info(`Consumer being created for ${sqs.docsign}`);

const app = Consumer.create({
  queueUrl: sqs.docsign,
  handleMessage: async (message) => {
    logger.info('Docsign queue message received', message);
    const body = JSON.parse(message.Body);
    const msg = JSON.parse(body.Message);

    const signingrequest = await OrderDocSigning.findOneAndUpdate({
      requestId: msg._id,
      ...(!testing.DISABLE_DOC_SIGNING_STATUS_CHECK && { status: 'created' }),
    }, {
      status: msg.status.name,
      meta: msg,
    });

    if (signingrequest) {
      // check all order docsigning
      const count = await OrderDocSigning.aggregate([
        {
          $match: {
            orderId: mongo.Types.ObjectId(msg.order),
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

      if (countMap.failure > 0) {
        const order = await RenewalOrder.findOneAndUpdate({
          _id: signingrequest.orderId,
        }, {
          signingstatus: 'failure',
          esignfailure: !countMap.success,
        });

        if (testing.DISABLE_DOC_SIGNING_STATUS_CHECK  || !isEqual(order.signingstatus, 'failure')) {
          await ZeebeService.publishMessage(order._id.toString(), 'signing_callback_event', {
            signingstatus: 'failure',
          });
        }
      }

      if (countMap.success > 0 && !countMap.created && !countMap.failure) {
        const order = await RenewalOrder.findOneAndUpdate({
          _id: signingrequest.orderId,
        }, {
          signingstatus: 'success',
        }, {
          new: true,
        });
        await ZeebeService.publishMessage(order._id.toString(), 'signing_callback_event', {
          signingstatus: order.signingstatus,
        });
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
