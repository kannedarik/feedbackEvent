/* eslint-disable no-unused-vars */
Promise = require('bluebird'); // eslint-disable-line no-global-assign
const { Consumer } = require('sqs-consumer');
const AWS = require('aws-sdk');
const { sqs } = require('./config/vars');
const whitelistservice = require('./api/services/whitelist');

AWS.config.update({
  region: 'ap-south-1',
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
});
const SqS = new AWS.SQS({ region: 'ap-south-1' });

const app = Consumer.create({
  queueUrl: sqs,
  handleMessage: async (message) => {
    console.log(JSON.stringify((message)).replace(/\\/g, ''));
    const data = JSON.parse(message.Body);
    await whitelistservice.checkfile(data);
  },
});

module.exports = app;
