const AWS = require('aws-sdk');
const { isEmpty } = require('lodash');
const { paymentsQueue, delayBeforeRequeue } = require('../../config/vars');
const logger = require('../../config/logger').logger;
const commons = require('../utils/commons.utils');

AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
});

const SQS = new AWS.SQS({region: 'ap-south-1' });

exports.sendMessageToSQSWithDelay = async (message) => {
  try {
    if (isEmpty(message)) {
      const errorObject = {
        code: 'invalid_message',
        UserMsg: 'Please give proper message to queue',
      };
      throw errorObject;
    }
    const formattedMsg = {
      Message: JSON.stringify(message),
    }
    const params = {
      QueueUrl: paymentsQueue,
      MessageBody: JSON.stringify(formattedMsg),
      DelaySeconds: delayBeforeRequeue,
    }
    const publishTextPromise = await SQS.sendMessage(params).promise();
    logger.info(`Message published to SQS with message :: ${commons.util.inspect(params, {depth: null})} result :: ${commons.util.inspect(publishTextPromise)}`)
    return publishTextPromise;
  } catch (err) {
    throw err;
  }
}
