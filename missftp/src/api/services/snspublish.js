const AWS = require('aws-sdk');
const { isEmpty } = require('lodash');
const { sns } = require('../../config/vars');

AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
});

const SNS = new AWS.SNS({ region: 'ap-south-1' });

exports.publishMessage = async (message) => {
  try {
    if (isEmpty(message)) {
      const errorObject = {
        code: 'invalid_message',
        UserMsg: 'Please give proper message to queue',
      };
      throw errorObject;
    }
    const params = {
      TopicArn: sns,
      Message: JSON.stringify(message),
    };
    const publishTextPromise = await SNS.publish(params).promise();
    console.log(publishTextPromise);
    return publishTextPromise;
  } catch (err) {
    throw err;
  }
};
