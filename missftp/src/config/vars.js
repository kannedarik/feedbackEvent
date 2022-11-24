const path = require('path');

// import .env variables
require('dotenv-safe').load({
  path: path.join(__dirname, '../../.env'),
  sample: path.join(__dirname, '../../.env.example'),
});

module.exports = {
  env: process.env.NODE_ENV,
  port: process.env.PORT,
  mongo: {
    uri: process.env.MONGO_URI,
  },
  telegram: {
    token: process.env.TELEGRAM_TOKEN,
    channels: {
      dev: '-1001063748362',
    },
  },
  sqs: process.env.SQS_URL,
  sns: process.env.SNS_URN,
  s3bucket: process.env.MIS_BUCKET,
  s3keyprefix: process.env.NODE_ENV === 'production' ? 'prod' : 'dev',
  sftpip: process.env.SFTPIP,
};
