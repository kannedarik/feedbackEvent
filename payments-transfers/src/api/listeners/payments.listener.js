const _ = require('lodash');
const vars = require('../../config/vars');
const commons = require('../utils/commons.utils');
const logger = require('../../config/logger').logger;
const sequelize = require('../models').sequelize;

const Consumer = require('sqs-consumer');
var CoreService = require('../services/core.service');
const awsService = require('../services/aws.service');
const PaymentRequest = sequelize.import('../models/paymentrequest.model');
const reqestStatus = require('../utils/constants/constants').PAYMENT_REQUEST_STATUS;
const paymentStatusConst = require('../utils/constants/constants').PAYMENT_STATUS;

const aws = require('aws-sdk');
const sqs = new aws.SQS({ region: 'ap-south-1' });
aws.config.update(vars.aws);

module.exports = function (app) {
  return {
    //Run when app loads
    initialize: function (next) {
      logger.info(`Listening to payments queue initialized at :: ${commons.util.inspect(commons.moment().toISOString())}`);
      const app = Consumer.create({
        queueUrl: vars.paymentsQueue,
        handleMessage: async (message, done) => {
          try {
            const messageBody = JSON.parse(message.Body);
            const parsedMessageBody = JSON.parse(messageBody.Message);
            const { paymentId, orderId, isValid, transferMapping } = parsedMessageBody;
            logger.info('Message received from payments service queue:', parsedMessageBody);
            // if (!isValid) {
            //   throw new Error(`No attribution possible for paymentid: ${paymentId}`);
            // }
            // get total amount of transfer request from mapping
            const amount = _.sumBy(transferMapping, mapping => mapping.amount);
            const paymentObject = {
              orderid: orderId,
              paymentid: paymentId,
              paymentstatus: paymentStatusConst.CAPTURED,
              amount,
              attribution: parsedMessageBody
            }
            logger.info('Calling core service with payment object', paymentObject);
            // await commons.timeout(10000);
            const paymentRequest = await PaymentRequest.findOne({ where: { paymentid: paymentId } });
            if (paymentRequest) {
              await CoreService.processPayment(paymentObject);     
            } else {
              logger.info(`Requeuing the message of ${paymentId}`);
              try {
                await awsService.sendMessageToSQSWithDelay(parsedMessageBody);
              } catch (err) {
                logger.error('Publish transfers message failure', { publishError: err });
              }
            }
          } catch (err) {
            logger.error('Error in processing payments queue message::', err);
          }
          done();
        },
        sqs: sqs
      });
      app.on('error', (err) => {
        logger.error('Some Error occurred in listening to the queue:', err.message);
      });
      app.on('processing_error', (err) => {
        logger.error('Some Error occurred in processing message:', err.message);
      });
      app.start();
    },
    routes: {
    }
  }
};
