const AWS = require('aws-sdk');
const { awsConfig } = require('../../config/vars');

exports.publish = async (opts) => {
  // update config
  AWS.config.update({
    accessKeyId: awsConfig.accessKey,
    secretAccessKey: awsConfig.accessSecret,
    region: awsConfig.region,
  });
  const sns = new AWS.SNS();

  const params = {
    TopicArn: opts.topic,
    Message: JSON.stringify(opts.message),
    MessageAttributes: opts.attributes,
  };
  await sns.publish(params).promise();
};
