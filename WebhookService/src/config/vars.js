const path = require('path');

// import .env variables
require('dotenv-safe').config({
  path: path.join(__dirname, '../../.env'),
  sample: path.join(__dirname, '../../.env.example'),
});

module.exports = {
  env: process.env.NODE_ENV,
  port: process.env.PORT,
  razorpay: {
    publickey: process.env.RAZORPAY_PUBLIC_KEY,
    privatekey: process.env.RAZORPAY_PRIVATE_KEY,
  },
  awsConfig: {
    accessKey: process.env.AWS_ACCESS_KEY_ID,
    accessSecret: process.env.AWS_SECRET_ACCESS_KEY,
    region: 'ap-south-1',
    sns: {
      topic: process.env.WEBHOOK_SNS,
    },
  },
};
