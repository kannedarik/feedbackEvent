const _ = require('lodash');
const vars = require('../../config/vars');
const commons = require('../utils/commons.utils');
const logger = require('../../config/logger').logger;

const Consumer = require('sqs-consumer');
var CoreService = require('../services/core.service');

const aws = require('aws-sdk');
const sqs = new aws.SQS({ region: 'ap-south-1' });
aws.config.update(vars.aws);

// aws.config.getCredentials(function(err) {
//     if (err) logger.log(err.stack);
//     //credentials not loaded
//     else {
//       console.log("Access key:", aws.config.credentials.accessKeyId);
//       console.log("Secret access key:", aws.config.credentials.secretAccessKey);
//       console.log("AWS region:", aws.config.region);
//     }
// });

module.exports = function (app) {
  return {
    //Run when app loads
    initialize: function (next) {
      logger.info(`Listening to razorpay-hook initialized at :: ${commons.util.inspect(commons.moment().toISOString())}`);
      const app = Consumer.create({
        queueUrl: vars.eventQueue,
        handleMessage: async (message, done) => {
          try {
            let parsedMessageBody = JSON.parse(message.Body);
            parsedMessageBody = JSON.parse(parsedMessageBody.Message);
            logger.info('Calling core service with message ', parsedMessageBody);
            await CoreService.notifyCoreService(parsedMessageBody);
            //await commons.timeout(vars.queue_delay);
          } catch (err) {
            logger.error('Something unexpected happened while processing message:', err);
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
